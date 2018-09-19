import { copy } from '@benzed/immutable'
import { Schema, number, defaultTo, object, length, string, required } from '@benzed/schema'
import { PromiseQueue } from '@benzed/async'

import Service from '../service'
import { mustBeEnabled, folderExists } from '../../util/validation'
import { isEnabled } from '../../util'

import path from 'path'
import fs from 'fs-extra'

import {

  BadRequest,
  NotAuthenticated,
  Unprocessable,
  TooManyRequests,
  LengthRequired,
  Conflict

} from '@feathersjs/errors'

import { serveFile } from './hooks'

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

const defaultToEmptyObject = defaultTo(() => { return {} })

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

    serve: object({
      endpoint: string(
        defaultTo('file'),
        length('>=', 1, 'must not be empty.')
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

/******************************************************************************/
// Uploader
/******************************************************************************/

const noop = () => null

class Uploader {

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
      .on(`${this.service.name}::upload`, this.handleStream)

  }

  createFileDoc = data => {

    const user = this.assertUser()

    if (user)
      data.meta = {
        ...data.meta || {},
        uploader: `${user._id}`
      }

    return this.app.files.create(data)

  }

  writeStream = (read, file) => new Promise((resolve, reject) => {

    const url = path.join(this.config.storage.local, `${file._id}`)

    const write = fs.createWriteStream(url)

    read
      .once('error', reject)
      // .on('data', this.uploadProgress(file, reject))
      .pipe(write)

    write
      .once('error', reject)
      .once('finish', resolve)

  })
    // .then(this.uploadSuccess)
    // .catch(this.uploadFail)
    .then(() => {
      read.destroy()
    })

  assertUser () {
    const { user } = this.socket.feathers
    const requiresAuth = this.config.auth && isEnabled(this.app.get('auth'))
    if (requiresAuth && !user)
      throw new NotAuthenticated(`Must be authenticated to upload files.`)

    return user
  }

  handleStream = async (stream, data = {}, reply = noop) => {

    let file
    try {

      file = await this.createFileDoc(data)

      this.queue.add(() => this.writeStream(stream, file))

      reply(null, `${file._id}`)

    } catch (err) {

      reply(err)
    }
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

class FileService extends Service {

  constructor (config, name, app) {
    validateSettings(copy(app.config))
    config = validateConfig(config)

    const service = super(config, name, app)
    return service
  }

  // initialize (config, app) {
  //   app.feathers.get(`/${config.serve.endpoint}`, serveFile)
  // }

  setupSocketMiddleware (io, app) {

    const service = this

    io.use((socket, next) => {
      socket.uploader = new Uploader(socket, service, app)
      next()
    })
  }

  addHooks () {

    this.before({
      get: serveFile
    })

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default FileService
