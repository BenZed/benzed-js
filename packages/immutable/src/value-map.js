import equals from './equals'
import copy from './copy'
import { indexOf } from './array'

import { $$copy, $$equals } from './symbols'

/******************************************************************************/
// Symbols
/******************************************************************************/

const $$keys = Symbol('map-keys')

const $$values = Symbol('map-values')

/******************************************************************************/
// Types
/******************************************************************************/

class ValueMap {

  constructor (keyValues) {

    if (keyValues) for (const keyValue of keyValues) {

      const [ key, value ] = keyValue

      this.set(key, value)
    }
  }

  get (key) {

    const index = indexOf(this[$$keys], key)
    if (index === -1)
      throw new Error(`Does not have item with id ${key}`)

    return this[$$values][index]
  }

  set (key, value) {

    let index = indexOf(this[$$keys], key)
    if (index === -1)
      index = this[$$keys].length

    this[$$keys][index] = key
    this[$$values][index] = value

    return this
  }

  has (key) {

    if (key === undefined)
      throw new Error('undefined is not a valid id.')

    const index = indexOf(this[$$keys], key)
    return index > -1
  }

  delete (key) {

    const index = indexOf(this[$$keys], key)

    const exists = index > -1
    if (exists) {
      this[$$keys].splice(index, 1)
      this[$$values].splice(index, 1)
    }

    return exists
  }

  clear () {
    this[$$keys].length = 0
    this[$$values].length = 0
  }

  forEach (func) {
    for (const [key, value] of this)
      func(value, key, this)
  }

  get size () {
    return this[$$keys].length
  }

  * keys () {
    for (let i = 0; i < this.size; i++) {
      const id = this[$$keys][i]
      yield id
    }
  }

  * values () {
    for (let i = 0; i < this.size; i++) {
      const value = this[$$values][i]
      yield value
    }
  }

  * [Symbol.iterator] () {
    for (let i = 0; i < this.size; i++) {
      const key = this[$$keys][i]
      const value = this[$$values][i]

      yield [key, value]
    }
  }

  [Symbol.toStringTag] () {
    return 'ValueMap'
  }

  [$$copy] () {
    const Type = this.constructor

    const args = []
    for (const keyValue of this)
      args.push(copy(keyValue))

    return new Type(args)
  }

  [$$equals] (right) {
    const Type = this.constructor
    const left = this

    if (typeof right !== 'object' || right instanceof Type === false)
      return false

    if (left.size !== right.size)
      return false

    return equals([ ...left ], [ ...right ])
  }

  [$$keys] = [];

  [$$values] = []

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValueMap
