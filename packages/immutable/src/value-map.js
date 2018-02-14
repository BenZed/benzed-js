import equals from './equals'
import copy from './copy'

import { COPY, EQUALS } from './symbols'

/******************************************************************************/
// Symbols
/******************************************************************************/

const KEYS = Symbol('map-keys')

const VALUES = Symbol('map-values')

/******************************************************************************/
// Helper
/******************************************************************************/

function getIndex (idA, map) {

  for (let index = 0; index < map[KEYS].length; index++) {
    const idB = map[KEYS][index]

    if (equals(idA, idB))
      return index
  }

  return undefined
}

/******************************************************************************/
// Types
/******************************************************************************/

class ValueMap {

  static get [Symbol.species] () {
    return ValueMap
  }

  constructor (...keyValues) {

    if (keyValues.length % 2 !== 0)
      throw new Error('Must be an even number of arguments.')

    for (let i = 0; i < keyValues.length; i += 2) {

      const key = keyValues[i]
      const value = keyValues[i + 1]

      this.set(key, value)
    }
  }

  get (key) {

    if (key === undefined)
      throw new Error('undefined is not a valid id.')

    const index = getIndex(key, this)
    if (index === undefined)
      throw new Error(`Does not have item with id ${key}`)

    return this[VALUES][index]
  }

  set (key, value) {

    if (key === undefined)
      throw new Error('undefined is not a valid id.')

    let index = getIndex(key, this)
    if (index === undefined)
      index = this[KEYS].length

    this[KEYS][index] = key
    this[VALUES][index] = value

    return this
  }

  has (key) {

    if (key === undefined)
      throw new Error('undefined is not a valid id.')

    const index = getIndex(key, this)
    return index !== undefined
  }

  delete (key) {

    if (key === undefined)
      throw new Error('undefined is not a valid id.')

    const index = getIndex(key, this)
    const exists = index !== undefined

    this[KEYS].splice(index, 1)
    this[VALUES].splice(index, 1)

    return exists
  }

  clear () {
    this[KEYS].length = 0
    this[VALUES].length = 0
  }

  forEach (func) {
    for (let i = 0; i < this.size; i++) {
      const id = this[KEYS][i]
      const value = this[VALUES][i]

      func([id, value], i, this)
    }
  }

  get size () {
    return this[KEYS].length
  }

  * keys () {
    for (let i = 0; i < this.size; i++) {
      const id = this[KEYS][i]
      yield id
    }
  }

  * values () {
    for (let i = 0; i < this.size; i++) {
      const value = this[VALUES][i]
      yield value
    }
  }

  * [Symbol.iterator] () {
    for (let i = 0; i < this.size; i++) {
      const id = this[KEYS][i]
      const value = this[VALUES][i]

      yield [id, value]
    }
  }

  [Symbol.toStringTag] () {
    return 'ValueMap'
  }

  [COPY] () {

    const valueMap = new ValueMap()

    for (const key of this.keys()) {
      const value = this.get(key)
      valueMap.set(
        copy(key),
        copy(value)
      )
    }

    return valueMap
  }

  [EQUALS] (to) {

    if (to instanceof ValueMap === false)
      return false

    if (to.size !== this.size)
      return false

    for (const [ toKey, toValue ] of to) {
      const value = this.get(toKey)
      if (!equals(value, toValue))
        return false
    }

    return true

  }

  [KEYS] = [];

  [VALUES] = []

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValueMap
