import is from 'is-explicit'
import { argsToConfig, OPTIONAL_CONFIG } from '../util'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

const layout = [
  {
    name: 'types',
    type: Function
  },
  {
    name: 'err',
    type: String
  },
  {
    name: 'cast',
    type: Function
  }
]

const configGeneric = argsToConfig(layout)

const configSpecific = argsToConfig(layout.slice(1))

const nameOf = t => t.name

/******************************************************************************/
// Generic
/******************************************************************************/

function type (...args) {

  const config = configGeneric(args)
  const { err, cast } = config

  const types = wrap(config.types)

  return value => {

    if (value == null)
      return value

    if (is(value, ...types))
      return value

    if (is(cast))
      value = cast(value)

    if (!is(value, ...types))
      return new Error(err || `Must be of type: ${types.map(nameOf).join(' or ')}`)

    return value
  }

}

/******************************************************************************/
// String
/******************************************************************************/

const toString = value => {

  if (is(value, Object) &&
      is(value.toString, Function) &&
      value.toString !== Object.prototype.toString)

    return value.toString()

  if (is(value, Boolean, Number))
    return `${value}`

  return value

}

function string (...args) {

  const config = configSpecific(args)

  config.types = String
  config.cast = config.cast || toString

  return type(config)
}
string[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Number
/******************************************************************************/

function number (...args) {

  const config = configSpecific(args)

  config.types = Number
  config.cast = config.cast || Number

  return type(config)
}
number[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Boolean
/******************************************************************************/

const toBoolean = value => {

  if (is(value, String))
    return /^true$/i.test(value)
      ? true
      : /^false$/i.test(value)
        ? false
        : value

  if (is(value, Number))
    return value === 1
      ? true
      : value === 0
        ? false
        : value

  if (is(value, Object) && is(value.valueOf, Function))
    value = value.valueOf()

  return value
}

function bool (...args) {
  const config = configSpecific(args)

  config.types = Boolean
  config.cast = config.cast || toBoolean

  return type(config)
}

bool[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Object
/******************************************************************************/

function object (...args) {

  const config = configSpecific(args)

  config.types = Object

  return type(config)
}

object[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Function
/******************************************************************************/

function func (...args) {

  const config = configSpecific(args)

  config.types = Function

  return type(config)
}

func[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Extends
/******************************************************************************/

/******************************************************************************/
// Exports
/******************************************************************************/

export default type

export { string, number, bool, object, func }
