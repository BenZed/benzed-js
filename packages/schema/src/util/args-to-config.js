import is from 'is-explicit'

import { pluck, wrap, unwrap } from '@benzed/array'

import validate from './validate'
import normalizeValidator from './normalize-validator'

/******************************************************************************/
// Validate Layout
/******************************************************************************/

// Be nice to actually use type validators for this, unfortunately they all depend
// on this function.

const allValid = value => value
const allPass = () => true

function checkLayouts (layouts) {

  layouts = wrap(layouts)

  for (const layout of layouts) {

    if (!is.plainObject(layout))
      throw new Error('argsToConfig expects an array of plain objects as layouts')

    if (!is.string(layout.name) || layout.name.length === 0)
      throw new Error('layout.name needs to be a non empty string')

    if (is.defined(layout.test) && !(is.func(layout.test) || is.arrayOf.func(layout.test)))
      throw new Error('layout.test must be a function')

    if (!layout.test)
      layout.test = allPass

    if (is.arrayOf.func(layout.test)) {
      const tests = layout.test
      layout.test = arg => tests.every(test => test(arg))
    }

    if (!is(layout.count, Number))
      layout.count = 1

    layout.required = !!layout.required

    layout.validate = layout.validate ? wrap(layout.validate) : [ allValid ]
    if (!is.arrayOf.func(layout.validate))
      throw new Error('layout.validate needs to be an array of Functions')

    layout.validate = layout.validate.map(normalizeValidator)

  }

  return layouts
}

/******************************************************************************/
// Move
/******************************************************************************/

function argsToConfig (
  layouts,
  masterErrName = 'validator',
  allowSingleObjectConfig = true) {

  layouts = checkLayouts(layouts)

  return (args, errName = masterErrName) => {

    let config = {}

    args = [ ...wrap(args) ]

    const arg0 = args[0]

    if (allowSingleObjectConfig && args.length === 1 && is.plainObject(arg0))
      config = { ...arg0 }

    else for (const layout of layouts) {
      const { name, count, test } = layout

      const found = pluck(args, test, count)

      if (found.length > 0)
        config[name] = count === 1 ? unwrap(found) : found
    }

    if (!is.plainObject(config))
      throw new Error(`${errName} config could not be converted to object`)

    // Set defaults and ensure required
    for (const layout of layouts) {

      const { name, required, count,
        default: _default, validate: validators } = layout

      if (config[name] === undefined && _default !== undefined)
        config[name] = _default

      if (validators !== undefined)
        config[name] = validate(validators, config[name])

      if (count > 1)
        config[name] = config[name] === undefined ? [] : wrap(config[name])

      if (config[name] === undefined && required)
        throw new Error(`${errName} config requires '${name}' property.`)

    }

    // TODO Remove keys that arn't supposed to be in config
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
