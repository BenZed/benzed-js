import equals from './equals'
import copy from './copy'
import { indexOf } from './array'

import { $$copy, $$equals } from './symbols'

/******************************************************************************/
// Symbols
/******************************************************************************/

const KEYS = Symbol('map-keys')

const VALUES = Symbol('map-values')

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

    const index = indexOf(this[KEYS], key)
    if (index === -1)
      throw new Error(`Does not have item with id ${key}`)

    return this[VALUES][index]
  }

  set (key, value) {

    let index = indexOf(this[KEYS], key)
    if (index === -1)
      index = this[KEYS].length

    this[KEYS][index] = key
    this[VALUES][index] = value

    return this
  }

  has (key) {

    if (key === undefined)
      throw new Error('undefined is not a valid id.')

    const index = indexOf(this[KEYS], key)
    return index > -1
  }

  delete (key) {

    const index = indexOf(this[KEYS], key)

    const exists = index > -1
    if (exists) {
      this[KEYS].splice(index, 1)
      this[VALUES].splice(index, 1)
    }

    return exists
  }

  clear () {
    this[KEYS].length = 0
    this[VALUES].length = 0
  }

  forEach (func) {
    for (const [key, value] of this)
      func(value, key, this)
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

  [$$copy] () {

    const map = new ValueMap()

    for (const [key, value] of this)
      map.set(copy(key), copy(value))

    return map
  }

  [$$equals] (to) {

    if (typeof to !== 'object' || to instanceof ValueMap === false)
      return false

    if (to.size !== this.size)
      return false

    for (const [ key, value ] of to)
      if (!equals(value, this.get(key)))
        return false

    return true
  }

  [KEYS] = [];

  [VALUES] = []

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValueMap
