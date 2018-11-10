import copy from './copy'
import copyJson from './copy-json'

import equals from './equals'

import get from './get'
import set from './set'

import change from './change'

import merge from './merge'

import {
  push, pop, shift, unshift, splice, reverse, sort, shuffle, unique,
  includes, indexOf, lastIndexOf
} from './array'

import ValueMap from './value-map'

import { $$equals, $$copy } from './symbols'

/******************************************************************************/
// Exports
/******************************************************************************/

copy.json = copyJson
copy.$$ = $$copy

equals.$$ = $$equals

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  copy, equals,

  get, set,

  change,

  merge,

  push, pop, shift, unshift, splice, reverse, sort, shuffle, unique,

  includes, indexOf, lastIndexOf,

  ValueMap,

  $$copy, $$equals
}
