import { copy } from '@benzed/immutable'
import { PromiseQueue } from '@benzed/async'
import {
  Schema, number, defaultTo, typeOf,
  object, length, string, range,
  required, format, any
} from '@benzed/schema'

import Service from '../service'
import { ObjectId } from 'mongodb'

import { mustBeEnabled, folderExists } from '../../util/validation'
import { isEnabled } from '../../util'
import { validateSchema } from '../../hooks'

import path from 'path'
import fs from 'fs-extra'
import mime from 'mime'

import {

  BadRequest,
  NotAuthenticated,
  Unprocessable,
  TooManyRequests,
  LengthRequired,
  Conflict

} from '@feathersjs/errors'

import { serveFile } from './middleware'

/******************************************************************************/
// Validation
/******************************************************************************/

const MAX_UPLOAD_SIZE = 1024 * 512 // 512 megabytes

const s3NotYetSupported = value =>
  value != null
    ? new Error('\'s3\' not yet supported.')
    : value

const validateSettings = new Schema({
  rest: mustBeEnabled('File Service requires rest to be enabled.'),
  mongodb: mustBeEnabled('File Service requires a database.')
})

const defaultToEmptyObject = defaultTo(() => Object({}))

const validateConfig = new Schema(
  object({
    storage: object({
      local: string(
        folderExists,
        required
      ),
      s3: string(
        s3NotYetSupported
      )
    },
    defaultToEmptyObject),

    upload: object({
      maxSize: number(
        defaultTo(MAX_UPLOAD_SIZE)
      ),
      numConcurrent: number(
        defaultTo(32)
      )
    },
    defaultToEmptyObject)// ,

  },
  required)
)

const fileSchema = new Schema(object({

  ext: string(
    format(/^\.\w+/),
    length('<=', 6)
  ),

  name: string,

  type: string(
    required,
    defaultTo(mime.default_type)
  ),

  size: number,

  uploader: any(
    value => ObjectId.isValid(value)
      ? ObjectId(value)
      : value
  )

}, false))

/******************************************************************************/
// Uploader
/******************************************************************************/

const noop = () => null

class WebsocketUploader {

  queue = null

  get config () {
    const { name } = this.service
    return this.app.get(['services', name])
  }

  constructor (socket, service, app) {
    this.queue = new PromiseQueue(1)
    this.socket = socket
    this.service = service
    this.app = app

    const streamer = require('socket.io-stream')

    streamer(this.socket)
      .on(`${this.service.name}::upload`, this.addStreamToQueue)

  }

  createFileDoc = data => {

    const user = this.assertUser()
    const ext = path.extname(data.name)
    const name = path.basename(data.name, ext)

    data = copy(data)
    data.ext = ext
    data.name = name
    data.type = ext
      ? mime.lookup(ext)
      : mime['default_type']

    if (user)
      data.uploader = `${user._id}`

    return this.app.files.create(data)

  }

  assertUser () {
    const { user } = this.socket.feathers
    const requiresAuth = this.config.auth && isEnabled(this.app.get('auth'))
    if (requiresAuth && !user)
      throw new NotAuthenticated(`Must be authenticated to upload files.`)

    return user
  }

  getFileUrl (file) {
    return path.join(this.config.storage.local, `${file._id}`)
  }

  // Stream Handling

  addStreamToQueue = async (stream, data = {}, reply = noop) => {

    let file
    try {

      file = await this.createFileDoc(data)

      this.queue.add(() => this.streamWrite(stream, file))

      reply(null, `${file._id}`)

    } catch (err) {

      reply(err)
    }
  }

  streamWrite = (read, file) => new Promise((resolve, reject) => {

    const url = this.getFileUrl(file)
    const write = fs.createWriteStream(url)

    read
      .once('error', reject)
      // .on('data', () => this.streamProgress(file, reject))
      .pipe(write)

    write
      .once('error', reject)
      .once('finish', resolve)

  })
    // .then(() => this.streamSuccess(file))
    .catch(err => this.streamFail(err, file))
    .then(() => read.destroy())

  // streamProgress = () => {
  //
  // }

  // async streamSuccess (file) {
  //
  // }

  async streamFail (error, file) {

    const errorJson = {
      name: error.name,
      code: error.code,
      message: error.message
    }

    await this.service.patch(file._id, { error: errorJson })
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

class FileService extends Service {

  constructor (config, name, app) {

    // Something breaks if we don't copy it
    const appConfig = app.config::copy()
    validateSettings(appConfig)

    config = validateConfig(config)

    const service = super(config, name, app)
    return service
  }

  setupSocketMiddleware (io, app) {

    const service = this

    io.use((socket, next) => {
      socket.uploader = new WebsocketUploader(socket, service, app)
      next()
    })
  }

  addMiddleware (config, app) {
    return [ this, config::serveFile ]
  }

  addHooks (config, app) {
    this.before({
      all: validateSchema(fileSchema)
    })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default FileService
