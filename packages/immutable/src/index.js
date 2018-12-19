import copy from './copy'
import serialize from './serialize'

import equals from './equals'

import get from './get'
import set from './set'

import merge from './merge'
import memoize from './memoize'

import {
  push, pop, shift, unshift, splice, reverse, sort, shuffle, unique,
  includes, indexOf, lastIndexOf
} from './array'

import ValueMap from './value-map'

import { $$equals, $$copy } from './symbols'

/******************************************************************************/
// Exports
/******************************************************************************/

copy.$$ = $$copy

equals.$$ = $$equals

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  copy, equals,

  serialize, memoize,

  get, set,

  merge,

  push, pop, shift, unshift, splice, reverse, sort, shuffle, unique,

  includes, indexOf, lastIndexOf,

  ValueMap,

  $$copy, $$equals
}
