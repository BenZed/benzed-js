import { CAST } from '../util/symbols'
import argsToConfig from '../util/args-to-config'

/******************************************************************************/
// Helper
/******************************************************************************/

const castConfig = argsToConfig({
  type: Function,
  name: 'casters',
  count: Infinity
})

/******************************************************************************/
// Main
/******************************************************************************/

function cast (...args) {

  const { casters } = castConfig(args)

  const cast = value => {

    for (const caster of casters) {
      value = caster(value)
      if (value instanceof Error)
        break
    }

    return value

  }

  cast[CAST] = true

  return cast
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default cast
