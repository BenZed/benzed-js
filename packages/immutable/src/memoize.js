import ValueMap from './value-map'

/******************************************************************************/
// Helper
/******************************************************************************/

function getCachedOrCall (...args) {

  const [ cache, method ] = this

  const exists = cache.has(args)
  const result = exists
    ? cache.get(args)
    : method(...args)

  if (!exists)
    cache.set(args, result)

  return result
}

/******************************************************************************/
// Main
/******************************************************************************/

function memoize (method) {

  if (typeof this === 'function')
    method = this

  const cache = new ValueMap()

  return [ cache, method ]::getCachedOrCall

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default memoize
