
/******************************************************************************/
// Spread from Math Object
/******************************************************************************/

const { abs: _abs, acos: _acos, acosh: _acosh, asin: _asin, asinh: _asinh,
  atan: _atan, atan2, atanh: _atanh, cbrt: _cbrt, ceil: _ceil, clz32: _clz32,
  cos: _cos, cosh: _cosh, exp: _exp, expm1: _expm1, floor: _floor,
  fround: _fround, hypot, imul, log: _log, log10: _log10, log1p: _log1p,
  log2: _log2, pow: _pow, random: _random, round: _round, sign: _sign, sin: _sin,
  sinh: _sinh, sqrt: _sqrt, tan: _tan, tanh: _tanh, trunc: _trunc } = Math

export { atan2, hypot, imul }

/******************************************************************************/
// Data
/******************************************************************************/

const SIN_PSUEDO_RANDOM_MULTIPLIER = 100000000

/******************************************************************************/
// Overridden functions
/******************************************************************************/

/**
 * random - Description
 *
 * @param {number} [min=0] Description
 * @param {type}   max     Description
 * @param {type}   various Description
 *
 * @return {type} Description
 */
export function random (min = 0, max = 1, seed) {

  let value

  if (typeof this === 'number')
    seed = this

  // handle alt as seed
  if (typeof seed === 'number') {
    value = _sin(seed) * SIN_PSUEDO_RANDOM_MULTIPLIER
    value -= _floor(value)

  // handle no alt, just straight random number
  } else
    value = _random()

  value *= max - min
  value += min

  return value
}

/**
 * round - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
export function round (...args) {

  let value, place

  // handles #::round(#) while preserving defaults
  if (typeof this === 'number') {
    ([ place = 1 ] = args)
    value = this
  } else
    ([ value, place = 1 ] = args)

  return place === 0 ? value : _round(value / place) * place

}

/**
 * floor - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
export function floor (...args) {

  let value, place

  // handles #::floor(#) while preserving defaults
  if (typeof this === 'number') {
    ([ place = 1 ] = args)
    value = this
  } else
    ([ value, place = 1 ] = args)

  // required to ensure negative place values yield the same
  // results as positive ones
  place = abs(place)

  return place === 0 ? value : _floor(value / place) * place

}

/**
 * ceil - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
export function ceil (...args) {

  let value, place

  // handles #::ceil(#) while preserving defaults
  if (typeof this === 'number') {
    ([ place = 1 ] = args)
    value = this
  } else
    ([ value, place = 1 ] = args)

  // required to ensure negative place values yield the same
  // results as positive ones
  place = abs(place)

  return place === 0 ? value : _ceil(value / place) * place

}

export function pow (...args) {

  let value, exp

  // handles #::pow(#) while preserving defaults
  if (typeof this === 'number') {
    ([ exp = 2 ] = args)
    value = this
  } else
    ([ value, exp = 2 ] = args)

  return _pow(value, exp)

}

export function abs (value) {

  // handles #::abs(#)
  if (typeof this === 'number')
    value = this

  return _abs(value)

}

export function acos (value) {

  // handles #::acos(#)
  if (typeof this === 'number')
    value = this

  return _acos(value)

}

export function acosh (value) {

  // handles #::acosh(#)
  if (typeof this === 'number')
    value = this

  return _acosh(value)

}

export function asin (value) {

  // handles #::asin(#)
  if (typeof this === 'number')
    value = this

  return _asin(value)

}

export function asinh (value) {

  // handles #::asinh(#)
  if (typeof this === 'number')
    value = this

  return _asinh(value)

}

export function atan (value) {

  // handles #::atan(#)
  if (typeof this === 'number')
    value = this

  return _atan(value)
}

export function atanh (value) {

  // handles #::atanh(#)
  if (typeof this === 'number')
    value = this

  return _atanh(value)
}

export function cbrt (value) {

  // handles #::cbrt(#)
  if (typeof this === 'number')
    value = this

  return _cbrt(value)

}

export function clz32 (value) {

  // handles #::clz32(#)
  if (typeof this === 'number')
    value = this

  return _clz32(value)

}

export function cos (value) {

  // handles #::cos(#)
  if (typeof this === 'number')
    value = this

  return _cos(value)

}

export function cosh (value) {

  // handles #::cosh(#)
  if (typeof this === 'number')
    value = this

  return _cosh(value)

}

export function exp (value) {

  // handles #::exp(#)
  if (typeof this === 'number')
    value = this

  return _exp(value)

}

export function expm1 (value) {

  // handles #::expm1(#)
  if (typeof this === 'number')
    value = this

  return _expm1(value)

}

export function fround (value) {

  // handles #::fround(#)
  if (typeof this === 'number')
    value = this

  return _fround(value)

}

export function log (value) {

  // handles #::log(#)
  if (typeof this === 'number')
    value = this

  return _log(value)

}

export function log10 (value) {

  // handles #::log10(#)
  if (typeof this === 'number')
    value = this

  return _log10(value)

}

export function log1p (value) {

  // handles #::log1p(#)
  if (typeof this === 'number')
    value = this

  return _log1p(value)

}

export function log2 (value) {

  // handles #::log2(#)
  if (typeof this === 'number')
    value = this

  return _log2(value)

}

export function sign (value) {

  // handles #::sign(#)
  if (typeof this === 'number')
    value = this

  return _sign(value)

}

export function sin (value) {

  // handles #::sin(#)
  if (typeof this === 'number')
    value = this

  return _sin(value)

}

export function sinh (value) {

  // handles #::sinh(#)
  if (typeof this === 'number')
    value = this

  return _sinh(value)

}

export function sqrt (value) {

  // handles #::sqrt(#)
  if (typeof this === 'number')
    value = this

  return _sqrt(value)

}

export function tan (value) {

  // handles #::tan(#)
  if (typeof this === 'number')
    value = this

  return _tan(value)

}

export function tanh (value) {

  // handles #::tanh(#)
  if (typeof this === 'number')
    value = this

  return _tanh(value)

}

export function trunc (value) {

  // handles #::trunc(#)
  if (typeof this === 'number')
    value = this

  return _trunc(value)

}

export function max (...params) {

  let current = -Infinity
  for (const param of params)
    if (param > current)
      current = param

  return current
}

export function min (...params) {

  let current = Infinity
  for (const param of params)
    if (param < current)
      current = param

  return current
}
