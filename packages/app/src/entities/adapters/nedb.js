import path from 'path'
import fs from 'fs-extra'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import { Service as NedbService } from 'feathers-nedb'
import NeDB from 'nedb'
import is from 'is-explicit'
import { isService } from '../../util'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validators
/******************************************************************************/

const fsExistsWithDbExt = value => {

  if (!is.defined(value))
    return value

  if (path.extname(value) !== '.db')
    throw new Error('must have a \'.db\' extension.')

  const dir = path.dirname(value)
  if (!fs.existsSync(dir))
    throw new Error('parent directory must exist on the file system.')

  return value
}

const validateOptions = <object key='nedb'>

  <bool key='autoload' default={!!true} />
  <string key='filename' validate={fsExistsWithDbExt}/>

</object>

/******************************************************************************/
// Helpers
/******************************************************************************/

const NEDB_MODELS = {}

// For testing, you can't call new Nedb() more than once for the same file,
// so we have to cache them here.
const getNeDBModel = config => {

  const { filename, autoload } = config

  // Dont need to cache models if they're in-memory only
  if (!filename)
    return new NeDB(config)

  const exists = filename in NEDB_MODELS

  const nedb = exists
    ? NEDB_MODELS[filename]
    : NEDB_MODELS[filename] = new NeDB(config)

  if (exists && autoload)
    nedb.loadDatabase()

  return nedb
}

/******************************************************************************/
// Main
/******************************************************************************/

const nedb = props => {

  const { children, ...rest } = props

  const options = validateOptions(rest)
  return config => {

    if (isService(config))
      throw new Error('cannot apply multiple database adapters to a service')

    const { _hooksToAdd, ...rest } = config

    const service = new NedbService({
      Model: getNeDBModel(options),
      ...rest
    })

    service._hooksToAdd = _hooksToAdd

    return service

  }
}
/******************************************************************************/
// Exports
/******************************************************************************/

export default nedb
