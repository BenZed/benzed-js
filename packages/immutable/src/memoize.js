import ValueMap, { $$keys, $$values } from './value-map'

/******************************************************************************/
// Helper
/******************************************************************************/

function getCachedOrCall (...args) {

  const [ cache, method, maxCacheSize = Infinity ] = this

  const exists = cache.has(args)
  const result = exists
    ? cache.get(args)
    : method(...args)

  if (!exists)
    cache.set(args, result)

  if (!exists) while (cache[$$keys].length > maxCacheSize) {
    cache[$$keys].shift()
    cache[$$values].shift()
  }

  return result
}

/******************************************************************************/
// Main
/******************************************************************************/

function memoize (method, maxCacheSize) {

  if (typeof this === 'function') {
    maxCacheSize = method
    method = this
  }

  const cache = new ValueMap()

  const memoized = [ cache, method, maxCacheSize ]::getCachedOrCall

  return Object.defineProperty(
    memoized,
    'name',
    { value: (method.name || '(anonymous)') + ' memoized' }
  )
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default memoize
