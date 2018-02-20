import adjacent from './adjacent'
import shuffle from './shuffle'
import isArrayLike from './is-array-like'
import isIterable from './is-iterable'
import { wrap, unwrap } from './wrap'

import SortedArray, { UnsafeSortError } from './sorted-array'

export {
  adjacent,
  shuffle,

  wrap,
  unwrap,

  isArrayLike,
  isArrayLike as hasNumericLength,
  isIterable,

  SortedArray,
  UnsafeSortError

}
