import is from 'is-explicit'
import { copy, set, push } from '@benzed/immutable'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Bones of what will be Schema.js
/******************************************************************************/

// Which will replace feathers-schema with a better api
// and be optionally asyncronous so it works better with regular data

/******************************************************************************/
// Canned Validators
/******************************************************************************/

function required (msg = 'is required') {
  return (value, { path }) => value != null
    ? value
    : new Error(`${path.join('.')} ${msg}`)
}

function type (...types) {
  return (value, { path }) => {
    if (value == null || is(value, ...types))
      return value

    throw new Error(`${path.join('.')} must be of type: ${types.map(f => f.name)}`)
  }
}

type.plainObject = (value, { path }) => value == null || is.plainObject(value)
  ? value
  : new Error(`${path.join('.')} must be a plain object.`)

/******************************************************************************/
// Helper
/******************************************************************************/

function validates (schema, data, util) {

  if (is.plainObject(schema)) {

    const dataIsPlainObject = is.plainObject(data)
    const input = dataIsPlainObject ? data : {}

    for (const key in schema) {
      const result = validates(
        schema[key],
        input[key],
        set(util, 'path', path => push(path, key))
      )
      if (result === undefined)
        continue

      if (!dataIsPlainObject)
        data = {}

      data[key] = result
    }

  } else for (const validator of schema) {

    const isSubSchema = is.plainObject(validator)
    if (isSubSchema && !is.plainObject(data))
      continue

    data = isSubSchema
      ? validates(validator, data, util)
      : validator(data, util)

    if (data instanceof Error)
      throw data
  }

  return data

}

/******************************************************************************/
// Main
/******************************************************************************/

function Schema (schema, path = []) {

  return (data, ...args) => {

    const util = {
      original: data,
      args,
      path: wrap(copy(path))
    }

    return validates(schema, copy(data), util)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export {
  Schema,
  required,
  type
}
