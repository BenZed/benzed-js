import copy from './copy'
import copyJson from './copy-json'

import equals from './equals'

import get from './get'
import set from './set'

import merge from './merge'

import {
  push, pop, shift, unshift, splice, reverse, sort, shuffle, unique,
  includes, indexOf, lastIndexOf
} from './array'

import ValueMap from './value-map'

import { EQUALS, COPY } from './symbols'

/******************************************************************************/
// Exports
/******************************************************************************/

copy.json = copyJson

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  copy, equals,

  get, set,

  merge,

  push, pop, shift, unshift, splice, reverse, sort, shuffle, unique,

  includes, indexOf, lastIndexOf,

  ValueMap,

  COPY, EQUALS
}
