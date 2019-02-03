import { pow, floor } from './index'

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperties } = Object

const getNumberOfDecimalPlaces = value =>

  floor(value) === value
    ? 0
    : value
      .toString()
      .split('.')[1]
      .length

const getGreatestCommonDivisor = (numerator, denominator) =>

  denominator > Number.EPSILON
    ? getGreatestCommonDivisor(denominator, numerator % denominator)
    : numerator

/******************************************************************************/
// Class
/******************************************************************************/

class Fraction {

  constructor (value) {

    if (Number.isNaN(value))
      throw new Error('cannot convert NaN to a fraction')

    const denominator = pow(10, getNumberOfDecimalPlaces(value))
    const numerator = value * denominator

    const divisor = getGreatestCommonDivisor(numerator, denominator)

    this.numerator = numerator / divisor
    this.denominator = denominator / divisor

    defineProperties(this, {
      numerator: {
        value: numerator / divisor,
        enumerable: true,
        writable: false,
        configurable: false
      },

      denominator: {
        value: denominator / divisor,
        enumerable: true,
        writable: false,
        configurable: false
      }
    })

  }

  toString () {
    return `${this.numerator}/${this.denominator}`
  }

  valueOf () {
    return this.numerator / this.denominator
  }

  * [Symbol.iterator] () {
    yield this.numerator
    yield this.denominator
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function toFraction (value) {
  if (typeof this === 'number')
    value = this

  return new Fraction(value)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default toFraction
