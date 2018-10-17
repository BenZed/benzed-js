import is from 'is-explicit'

import { clamp } from '@benzed/math'

import SpecificType from './specific-type'

import { addName, propToConfig, propIsEnabled } from '../util'

/******************************************************************************/
// Layout
/******************************************************************************/

const clampConfig = propToConfig([{
  name: 'min',
  test: is.number,
  required: true,
  default: 0
}, {
  name: 'max',
  test: is.number,
  required: true,
  default: 1
}])

/******************************************************************************/
// Default Cast
/******************************************************************************/

const toNumber = value => {
  const number = Number(value)

  return Number.isNaN(number)
    ? value
    : number
}

/******************************************************************************/
// Main
/******************************************************************************/

class NumberType extends SpecificType {

  constructor () {
    super(Number)
  }

  cast (config) {

    if (config === true)
      config = toNumber

    return super.cast(config)
  }

  clamp (prop) {
    if (!propIsEnabled(prop))
      return null

    const { min, max } = prop = clampConfig(prop)
    if (min >= max)
      throw new Error('min value must be below max')

    const validator = value =>
      is.number(value)
        ? clamp(value, min, max)
        : value

    validator::addName(`clamp${min}-${max}`)

    return {
      validator,
      prop
    }

  }

  /* other handy number validators

  round () { }

  floor () { }

  ceil () { }

  abs () { }

  */

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default NumberType
