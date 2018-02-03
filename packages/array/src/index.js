import adjacent from './adjacent'
import shuffle from './shuffle'
import isArrayLike from './is-array-like'
import isIterable from './is-iterable'

import SortedArray, { UnsafeSortError } from './sorted-array'

export {
  adjacent,
  shuffle,

  isArrayLike,
  isArrayLike as hasNumericLength,
  isIterable,

  SortedArray,
  UnsafeSortError

}
