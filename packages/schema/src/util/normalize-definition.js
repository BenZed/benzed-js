import is from 'is-explicit'
import { SELF, ZERO_CONFIG } from './symbols'

/******************************************************************************/
// Helper
/******************************************************************************/

function countKeys (obj) {

  let num = Object.keys(obj).length

  if (SELF in obj)
    num++

  return num
}

/******************************************************************************/
// Main
/******************************************************************************/

function normalizeDefinition (def) {

  if (is(def, Function))
    def = [ def ]

  const isArray = is(def, Array)
  const isPlainObject = !isArray && is.plainObject(def)
  const hasSelf = isPlainObject && SELF in def

  if (!isArray && !isPlainObject)
    throw new Error('definition must be a plain object, function, or array of functions')

  if (isPlainObject && countKeys(def) === 0)
    throw new Error('if providing a definition as an object, it must have at least one key')

  if (isArray && !is.arrayOf(def, Function))
    throw new Error('if providing a definition as an array, it must be an array of functions')

  if (isArray) for (let i = 0; i < def.length; i++) {
    const func = def[i]
    if (func[ZERO_CONFIG]) {
      const result = func()
      if (!is(result, Function))
        throw new Error('validators with ZERO_CONFIG enabled must return a function')

      def[i] = func()
    }
  }

  if (hasSelf && is.plainObject(def[SELF]))
    throw new Error('functions defined on an object with the SELF symbol must be a function or array of functions.')

  if (isPlainObject) for (const key in def)
    def[key] = normalizeDefinition(def[key])

  if (hasSelf)
    def[SELF] = normalizeDefinition(def[SELF])

  return def

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default normalizeDefinition
