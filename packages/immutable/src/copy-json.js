import { CIRCULAR, EXCLUDED } from './symbols'
import { isIterable } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

function convertPrimitive (value, type) {

  if (type === 'function' || type === 'symbol' || type === 'undefined')
    return EXCLUDED

  if (type === 'number' && (Number.isNaN(value) || !isFinite(value)))
    return `${value}`

  return value
}

function copyConsideringRefs (value, refs) {

  let type = typeof value
  if (value !== null && type === 'object' && typeof value.toJSON === 'function') {
    value = value.toJSON()
    type = typeof value
  }

  if (value === null || type !== 'object')
    return convertPrimitive(value, type)

  if (!refs)
    refs = []

  if (refs.includes(value))
    return CIRCULAR

  refs.push(value)

  if (isIterable(value)) {
    const json = []
    for (const item of value) {
      const result = copyConsideringRefs(item, refs)
      if (result !== EXCLUDED && result !== CIRCULAR)
        json.push(result)
    }
    return json
  }

  const json = {}
  for (const key in value) {
    const result = copyConsideringRefs(value[key], refs)
    if (result !== EXCLUDED && result !== CIRCULAR)
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
  return result !== EXCLUDED
    ? result
    : null
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copyJson
