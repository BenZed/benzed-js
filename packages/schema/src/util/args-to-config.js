import is from 'is-explicit'
import validate from '../validate'
import { pluck, wrap, unwrap } from '@benzed/array'
import { SELF } from './symbols'

/******************************************************************************/
// Validate Layout
/******************************************************************************/

const arrayOfPlainObjects = (value, context) => {

  value = wrap(value)

  return value.length === 0 || !value.every(a => is.plainObject(a))
    ? new Error('argsToConfig expects be an array of plain objects')
    : value
}

const log = (value, context) => {
  // console.log(value, context)
  return value
}

const defaultOne = value =>
  !is(value)
    ? 1
    : value

const trueToInfinite = value =>
  value === true
    ? Infinity
    : !is(value, Number) || value <= 0
      ? new Error('must be true or a positive number')
      : value

const nonEmptyString = value =>
  !is(value, String) || value.length === 0
    ? new Error('must be a non-empty string')
    : value

const isFunctionOrArrayOf = value =>
  !is(value, Function) && !is.arrayOf(value, Function)
    ? new Error('must be a function or an array of functions')
    : wrap(value)

const allPass = value => value

const toBool = value => !!value

const defaultsToAllPass = value => !is(value) ? allPass : value

const layoutValidateFuncs = {

  [SELF]: [ arrayOfPlainObjects, log ],

  name: [ nonEmptyString, log ],
  count: [ defaultOne, trueToInfinite ],
  type: [ isFunctionOrArrayOf ],

  validate: [ defaultsToAllPass, isFunctionOrArrayOf ],
  default: [ allPass ],
  required: [ toBool ]
}

/******************************************************************************/
// Move
/******************************************************************************/

function argsToConfig (layouts) {

  layouts = validate(layoutValidateFuncs, layouts, { path: [] })

  return args => {

    let config = {}

    args = [ ...wrap(args) ]

    if (args.length === 1 && is.plainObject(args[0]))
      config = { ...args[0] }

    else for (const layout of layouts) {
      const { name, count, type: Types } = layout
      const found = args::pluck(arg => is(arg, ...Types), count)

      if (found.length > 0)
        config[name] = count === 1 ? unwrap(found) : found
    }

    if (!is.plainObject(config))
      throw new Error('Invalid type config.')

    // Set defaults and ensure required
    for (const layout of layouts) {
      const { name, default: _default, type, required, validate: validateFuncs } = layout

      if (config[name] === undefined && _default !== undefined)
        config[name] = _default

      if (validate !== undefined)
        config[name] = validate(validateFuncs, config[name], { path: [] })

      if (config[name] === undefined && required)
        throw new Error(`config requires ${type.map(t => t.name).join(' or ')} '${name}' property.`)

    }

    // Remove keys that arn't supposed to be in config
    for (const key in config)
      if (!layouts.some(layout => layout.name === key))
        delete config[key]

    return config
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

export default argsToConfig
