import is from 'is-explicit'
import validate from '../validate'
import { pluck } from '@benzed/array'
import { SELF, ARRAY } from './symbols'

/******************************************************************************/
// Validate Layout
/******************************************************************************/

const arrayOfPlainObjects = (value, context) => {

  context[ARRAY] = true

  return !is(value, Array) || !value.every(a => is.plainObject(a))
    ? new Error('argsToConfig expects be an array of plain objects')
    : value
}

const log = (value, context) => console.log(value, context) || value

const defaultOne = value =>
  !is(value)
    ? 1
    : value

const trueToInfinite = value =>
  value === true
    ? Infinity
    : !is(value, Number) || value <= 0
      ? new Error('count must be true or a positive number')
      : value

const nonEmptyString = value =>
  !is(value, String) || value.length === 0
    ? new Error('must be a non-empty string')
    : value

const layoutValidateFuncs = {
  [SELF]: [ arrayOfPlainObjects, log ],
  name: [ nonEmptyString, log ],
  count: [ defaultOne, trueToInfinite ]
}

/******************************************************************************/
// Move
/******************************************************************************/

function argsToConfig (layout) {

  layout = validate(layoutValidateFuncs, layout, { path: [] })

  return args => {

    let config = {}

    if (args.length === 1 && is.plainObject(args[0]))
      config = args[0]

    else if (is.plainObject(layout)) for (const key in layout) {

      const { type, only = Infinity } = layout[key]

      const types = is(type, Array) ? type : [ type ]

      config[key] = pluck(args, v => is(v, ...types), only)

      if (only === 1)
        config[key] = config[key][0]
    }

    if (!is.plainObject(config))
      throw new Error('Invalid type config.')

    for (const key in layout) {
      const { default: def } = layout[key]

      if (def !== undefined && config[key] === undefined)
        config[key] = typeof def === 'function'
          ? def(config)
          : def
    }

    return config
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

export default argsToConfig
