import is from 'is-explicit'

import { argsToConfig } from '../util'

/******************************************************************************/
// Helper
/******************************************************************************/

const argsToTypeConfig = argsToConfig({

  err: {
    type: String,
    only: 1,
    default: config => `Must be of type: ${config.types.map(t => t.name)}`
  },

  types: {
    type: Function
  },

  cast: {
    type: [Function, Boolean],
    default: true
  }

})

function cast (types) {

  return value => {

    if (!is(value))
      return value

    const isArray = is(value, Array)

    for (const Type of types)
      try {
        value = isArray ? Type(...value) : Type(value)
        break
      } catch (err) { }

    return value
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

function typeChecker (...args) {

  const is = this

  const config = argsToTypeConfig(args)

  if (config.cast && !is(config.cast, Function))
    config.cast = cast(config.types)

  return value => {

    if (!is(value))
      return

    if (!is(value, ...config.types) && config.cast)
      value = config.cast(value)

    if (is(value, ...config.types))
      return value

    return new Error(config.err)
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

const type = is::typeChecker

for (const check of [ 'arrayOf', 'objectOf' ])
  type[check] = is[check]::typeChecker

/******************************************************************************/
// Exports
/******************************************************************************/

export default type
