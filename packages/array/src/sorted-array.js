
/******************************************************************************/
// Data
/******************************************************************************/

const { defineProperty } = Object

/******************************************************************************/
// Symbols
/******************************************************************************/

const STRICT = Symbol('return-(-1)-if-missing')
const COMPARER = Symbol('compare-function')
const UNSORTED = Symbol('is-not-sorted')

/******************************************************************************/
// Helper
/******************************************************************************/

function ascending (a, b) {
  return a > b
    ? 1
    : a < b
      ? -1
      : 0
}

function binarySearch (arr, value, strict) {

  let min = 0
  let max = arr.length

  // in case the array is descending
  const descending = arr[min] > arr[max - 1]

  while (min < max) {
    const mid = (min + max) >> 1
    const _value = arr[mid]

    if (_value === value)
      return mid

    if (descending ? _value > value : _value < value)
      min = mid + 1
    else
      max = mid
  }

  return strict === STRICT ? -1 : min
}

/******************************************************************************/
// Errors
/******************************************************************************/

class UnsortedArrayError extends Error {

  constructor (methodName) {
    super(`${methodName}() cannot be called on an SortedArray that is out of order. Call sort() before ${methodName}().`)
    this.name = 'UnsafeSortError'
  }

}

/******************************************************************************/
// Proxy
/******************************************************************************/

const PROXY_CONFIGURATION = {

  set (array, index, value) {

    const i = parseInt(index)

    const { unsorted } = array
    const isSettingIndex = !Number.isNaN(i)
    if (isSettingIndex && !unsorted && array.length > 1) {

      const { length, ascending } = array
      const lastIndex = length - 1

      const next = array[i + 1]
      const prev = array[i - 1]
      if (i < lastIndex && (ascending ? value > next : value < next))
        array[UNSORTED] = true

      else if (i > 0 && (ascending ? value < prev : value > prev))
        array[UNSORTED] = true

      else if (i > length || i < 0)
        array[UNSORTED] = true
    }

    array[index] = value

    return true
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

// TODO make SortedArray derive from UnsafeSortedArray and add all the unsort stuff

class SortedArray extends Array {

  constructor (...args) {
    super(...args)

    defineProperty(this, UNSORTED, { writable: true, value: false })
    defineProperty(this, COMPARER, { writable: true, value: ascending })

    this.sort()

    return new Proxy(this, PROXY_CONFIGURATION)
  }

  // Insertion sort
  sort (comparer) {

    if (comparer)
      this.comparer = comparer

    const { length } = this

    for (let i = 1; i < length; i++) {
      const item = this[i]

      // eslint-disable-next-line no-var
      for (var ii = i - 1; ii >= 0 && this.comparer(this[ii], item) > 0; ii--)
        this[ii + 1] = this[ii]

      this[ii + 1] = item
    }

    this[UNSORTED] = false

    return this
  }

  // Extended to return SortedArray

  filter (...args) {
    const filtered = super.filter(...args)
    filtered.comparer = this.comparer
    filtered[UNSORTED] = this[UNSORTED]

    return filtered
  }

  map (...args) {
    const mapped = super.map(...args)
    mapped.comparer = this.comparer

    return mapped
  }

  slice (...args) {
    const sliced = super.slice(...args)
    sliced.comparer = this.comparer

    return sliced
  }

  concat (arr) {
    const concated = super.concat(arr)
    concated.comparer = this.comparer

    let unsorted = this.unsorted

    const { ascending } = this

    const clen = concated.length
    const tlen = this.length

    if (!unsorted && clen > tlen) for (let i = tlen; i < clen; i++) {
      const prev = concated[i - 1]
      const curr = concated[i]
      if (ascending ? curr < prev : curr > prev) {
        unsorted = true
        break
      }
    }

    concated[UNSORTED] = unsorted

    return concated
  }

  // REQUIRES SAFE

  lastIndexOf (value) {

    if (this[UNSORTED])
      throw new UnsortedArrayError('lastIndexOf')

    const index = binarySearch(this, value, STRICT)
    return index
  }

  indexOf (value) {

    if (this[UNSORTED])
      throw new UnsortedArrayError('indexOf')

    let index = binarySearch(this, value, STRICT)

    // Search returns the last index of a given value, where indexOf should
    // return the first
    while (this[index - 1] === value)
      index--

    return index
  }

  // NEW METHODS

  insert (value) {

    if (this[UNSORTED])
      throw new UnsortedArrayError('insert')

    const index = binarySearch(this, value, null)

    // super.splice because this.splice will set unsorted, which is unecessary
    // because this function cannot pollute the order
    super.splice(index, 0, value)

    return index
  }

  remove (value) {

    if (this[UNSORTED])
      throw new UnsortedArrayError('remove')

    const index = binarySearch(this, value, STRICT)
    if (index > -1)
    // super.splice because this.splice will set unsorted, which is unecessary
    // because this function cannot pollute the order
      super.splice(index, 1)

    return index
  }

  // NEW PROPERTIES

  get comparer () {
    return this[COMPARER]
  }

  set comparer (compareFunc) {
    if (typeof compareFunc !== 'function')
      compareFunc = ascending

    this[COMPARER] = compareFunc
  }

  get unsorted () {
    return this[UNSORTED]
  }

  get ascending () {
    const { length } = this

    return length > 1 && this[0] < this[length - 1]
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default SortedArray

export { SortedArray, UnsortedArrayError, UNSORTED }
