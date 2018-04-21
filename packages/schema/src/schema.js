import is from 'is-explicit'
import { ValidationError } from './util'

/******************************************************************************/
// Helper
/******************************************************************************/

const SKIP = Symbol('skip-remaining-validators')

const SELF = Symbol('validators-for-object-or-array')

function validate (data) {

  let output

  const funcs = this

  const isArray = funcs instanceof Array
  if (isArray) for (const func of funcs) {

    const result = func(data)
    if (result instanceof Error)
      throw new ValidationError('path not yet implemented', output.message)

    if (result === SKIP)
      break

    output = result

  }

  return output
}

function isGenericObject (value) {
  return value !== null && typeof value === 'object'
}

// function objectValidator (obj) {
//
//   const subValidators = {}
//   for (const key in obj)
//     subValidators[key] = Schema(obj[key])
//
//   const self = SELF in obj
//     ? Schema(obj[SELF])
//     : null
//
//   const func = value => {
//     let output
//     if (self)
//       output = self(output)
//
//     const valueIsGenericObject = isGenericObject(value)
//     if (!self && valueIsGenericObject)
//       output = {}
//
//     if (isGenericObject(output) && valueIsGenericObject) for (const key in subValidators)
//       output[key] = subValidators[key](value[key])
//
//     return output
//   }
//
//   return [ [func], subValidators ]
//
// }

/******************************************************************************/
// Main
/******************************************************************************/

function Schema (funcs) {

  if (is(funcs, Function))
    funcs = [ funcs ]

  const isArray = is(funcs, Array)
  const isPlainObject = !isArray && is.plainObject(funcs)

  if (!isArray && !isPlainObject)
    throw new Error('definition must be a plain object, function, or array of functions')

  if (isPlainObject && Object.keys(funcs).length === 0)
    throw new Error('if providing a definition as an object, it must have at least one key')

  if (isArray && !is.arrayOf(funcs, Function))
    throw new Error('if providing a definition as an array, it must be an array of functions')

  if (isPlainObject && SELF in funcs && is.plainObject(funcs[SELF]))
    throw new Error('functions defined on an object with the SELF symbol must be a function or array of functions.')

  if (isPlainObject) for (const key in funcs)
    funcs[key] = Schema(funcs[key])

  if (SELF in funcs)
    funcs[SELF] = Schema(funcs[SELF])

  const validator = funcs::validate

  if (isPlainObject) for (const key in funcs)
    validator[ key in validator ? '_' + key : key ] = funcs[key]

  return validator
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export { Schema, SKIP, SELF, SELF as $ }
