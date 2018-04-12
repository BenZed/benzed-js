import copy from './copy'
import equals from './equals'

import get from './get'
import set from './set'

import * as ArrayImmutable from './array'

import ValueMap from './value-map'

import { EQUALS, COPY } from './symbols'

/******************************************************************************/
// Build
/******************************************************************************/

const {
  push, pop, shift, unshift, splice, reverse, sort, shuffle,
  includes, indexOf, lastIndexOf
} = ArrayImmutable

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  copy, equals,

  get, set,

  push, pop, shift, unshift, splice, reverse, sort, shuffle,

  includes, indexOf, lastIndexOf,

  ArrayImmutable, ArrayImmutable as array,

  ValueMap,

  COPY, EQUALS
}
