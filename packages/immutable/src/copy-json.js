import { $$circular, $$excluded } from './symbols'
import { isIterable } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

function convertPrimitive (value, type) {

  if (type === 'function' || type === 'symbol' || type === 'undefined')
    return $$excluded

  if (type === 'number' && (Number.isNaN(value) || !isFinite(value)))
    return `${value}`

  return value
}

function copyConsideringRefs (value, refs) {

  let type = typeof value
  const isObject = (value !== null && type === 'object') || type === 'function'
  if (isObject && typeof value.toJSON === 'function') {
    value = value.toJSON()
    type = typeof value
  }

  if (value === null || type !== 'object')
    return convertPrimitive(value, type)

  if (!refs)
    refs = []

  if (refs.includes(value))
    return $$circular

  refs.push(value)

  if (isIterable(value)) {
    const json = []
    for (const item of value) {
      const result = copyConsideringRefs(item, refs)
      if (result !== $$excluded && result !== $$circular)
        json.push(result)
    }
    return json
  }

  const json = {}
  for (const key in value) {
    const result = copyConsideringRefs(value[key], refs)
    if (result !== $$excluded && result !== $$circular)
      json[key] = result
  }

  return json
}

/******************************************************************************/
// Main
/******************************************************************************/

function copyJson (...args) {

  const value = args.length > 0
    ? args[0]
    : this

  const result = copyConsideringRefs(value)
  return result !== $$excluded
    ? result
    : null
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copyJson
