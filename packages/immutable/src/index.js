import copy from './copy'
import equals from './equals'

import get from './get'
import set from './set'

import {
  push, pop, shift, unshift, splice, reverse, sort, shuffle,

  includes, indexOf, lastIndexOf
} from './array'

import ValueMap from './value-map'

import { EQUALS, COPY } from './symbols'

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  copy, equals,

  get, set,

  push, pop, shift, unshift, splice, reverse, sort, shuffle,

  includes, indexOf, lastIndexOf,

  ValueMap,

  COPY, EQUALS
}
