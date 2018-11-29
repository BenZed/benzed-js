import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import path from 'path'
import fs from 'fs-extra'

import NeDB from 'nedb'
import { Service } from 'feathers-nedb'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validators
/******************************************************************************/

const fsExistsWithDbExt = value => {

  if (path.extname(value) !== '.db')
    throw new Error('must have a \'.db\' extension.')

  const dir = path.dirname(value)
  if (!fs.existsSync(dir))
    throw new Error('parent directory must exist on the file system.')

  return value
}

const validate = <object key='config'>

  <object key='nedb' required>
    <bool key='autoload' default={!!true} />
    <string key='filename' required validate={fsExistsWithDbExt}/>
  </object>

  <object key='paginate' default={{ default: 100, max: 1000 }} required />
  <string key='id' default='_id' />
  <string key='path' default={ctx => `/${ctx.data.name}`} />
</object>

/******************************************************************************/
// Helpers
/******************************************************************************/

const NEDB_MODELS = {}

// For testing, you can't call new Nedb() more than once for the same file,
// so we have to cache them here.
const getNeDBModel = config => {

  const { filename } = config

  const exists = filename in NEDB_MODELS

  const nedb = exists
    ? NEDB_MODELS[filename]
    : NEDB_MODELS[filename] = new NeDB(config)

  if (exists)
    nedb.loadDatabase()

  return nedb
}

/******************************************************************************/
// Main
/******************************************************************************/

function setupNedbService (name, config) {

  const app = this

  config = validate(config, { data: { name } })

  const { path, nedb, id, paginate } = config

  const service = new Service({
    Model: getNeDBModel(nedb),
    id,
    paginate
  })

  app.set(name, config)
  app.use(path, service)

  return app.service(path)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupNedbService
