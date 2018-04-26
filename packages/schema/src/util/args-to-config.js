import is from 'is-explicit'
import { pluck } from '@benzed/array'

/******************************************************************************/
// Move
/******************************************************************************/

function argsToConfig (layout) {

  return args => {

    let config = {}

    if (args.length === 1 && is.plainObject(args[0]))
      config = args[0]

    else for (const key in layout) {

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
