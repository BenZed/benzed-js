import is from 'is-explicit'

import { pluck, wrap, unwrap } from '@benzed/array'

import validate from '../validate'
import reduceValidator from './reduce-validator'

/******************************************************************************/
// Validate Layout
/******************************************************************************/

// Be nice to actually use type validators for this, unfortunately they all depend
// on this function.

const allPass = value => value

function checkLayouts (layouts) {

  layouts = wrap(layouts)

  for (const layout of layouts) {

    if (!is.plainObject(layout))
      throw new Error('argsToConfig expects an array of plain objects as layouts')

    if (!is(layout.name, String) || layout.name.length === 0)
      throw new Error('layout.name needs to be a non empty string')

    if (!is(layout.count, Number))
      layout.count = 1

    layout.required = !!layout.required

    layout.type = layout.type ? wrap(layout.type) : []
    if (!is.arrayOf(layout.type, Function))
      throw new Error('layout.type needs to be an array of Functions')

    layout.validate = layout.validate ? wrap(layout.validate) : [ allPass ]
    if (!is.arrayOf(layout.validate, Function))
      throw new Error('layout.validate needs to be an array of Functions')

    layout.validate = layout.validate.map(reduceValidator)

  }

  return layouts
}

/******************************************************************************/
// Move
/******************************************************************************/

function argsToConfig (layouts, masterErrName = 'validator') {

  layouts = checkLayouts(layouts)

  return (args, errName = masterErrName) => {

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
      throw new Error(`${errName} config could not be converted to object`)

    // Set defaults and ensure required
    for (const layout of layouts) {
      const { name, default: _default, type, required, count, validate: validateFuncs } = layout

      if (config[name] === undefined && _default !== undefined)
        config[name] = _default

      if (validateFuncs !== undefined)
        config[name] = validate(validateFuncs, config[name], { path: [] })

      if (count > 1)
        config[name] = config[name] === undefined ? [] : wrap(config[name])

      if (config[name] === undefined && required)
        throw new Error(`${errName} config requires ${type.map(t => t.name).join(' or ')} '${name}' property.`)

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
