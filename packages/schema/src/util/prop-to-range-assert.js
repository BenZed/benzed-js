import is from 'is-explicit'
import propToConfig from './prop-to-config'

/******************************************************************************/
// Data
/******************************************************************************/

const OPERATORS = [ '>', '>=', '==', '<=>', '<=', '<' ]

/******************************************************************************/
// Comparer
/******************************************************************************/

const COMPARERS = {

  '>' (number) {
    const { value, err } = this
    return number > value
      ? value
      : handleError(err, 'greater than', value)
  },

  '>=' (number) {
    const { value, err } = this
    return number >= value
      ? value
      : handleError(err, 'equal to or greater than', value)
  },

  '<=>' (number) {
    const { min, max, err } = this

    return number >= min && number < max
      ? number
      : handleError(err, 'between', min, max)
  },

  '==' (number) {
    const { value, err } = this
    return number === value
      ? value
      : handleError(err, 'equal to', value)
  },

  '<=' (number) {
    const { value, err } = this
    return number <= value
      ? number
      : handleError(err, 'equal to or less than', value)
  },

  '<' (number) {
    const { value, err } = this
    return number < value
      ? number
      : handleError(err, 'less than', value)
  }

}

function handleError (err, diff, ...values) {
  const msg = is(err, String)
    ? err
    : err(diff, values)

  throw new Error(msg)
}

function getAsserter (config) {

  const asserter = config::COMPARERS[config.operator]

  asserter.config = config

  return asserter
}

/******************************************************************************/
// Config
/******************************************************************************/

const RANGE_LAYOUT = [
  {
    name: 'operator',
    test: value => OPERATORS.includes(value),
    validate: value => OPERATORS.includes(value) || !is.defined(value)
      ? value
      : throw new Error(`${String(value)} is not a valid operator`)
  },
  {
    name: 'err',
    test: [
      [String, Function]::is,
      value => !OPERATORS.includes(value)
    ],
    default: (diff, values) => `must be ${diff} ${values.join(' and ')}`
  },
  {
    name: 'min',
    test: is.number
  },
  {
    name: 'max',
    test: is.number
  },
  {
    name: 'value',
    test: is.number
  }
]

const defaultRangeConfig = propToConfig(RANGE_LAYOUT)

function checkExplicitConfig (operator, numbers) {

  if (!operator)
    operator = numbers.value ? '==' : '<=>'

  const isBetween = operator === '<=>'
  if (isBetween === is.number(numbers.value))
    throw new Error(`value must ${isBetween ? 'not ' : ''}be defined for ${operator}`)

  if (isBetween !== is.number(numbers.min) || isBetween !== is.number(numbers.max))
    throw new Error(`min and max must ${!isBetween ? 'not ' : ''}be defined for ${operator}`)

  if (isBetween && numbers.min > numbers.max)
    throw new Error(`min must be below max for ${operator}`)

  return { operator, ...numbers }
}

function fixImplicitConfig (operator, numbers) {

  numbers = Object
    .values(numbers)
    .filter(is.number)

  if (!operator)
    operator = numbers.length === 2
      ? '<=>'
      : '=='

  const isBetween = operator === '<=>'

  numbers.sort()

  let min, max, value
  if (isBetween && numbers.length >= 2) {
    min = Math.min(...numbers)
    max = Math.max(...numbers)
  } else if (!isBetween)
    [ value ] = numbers

  if (isBetween && (!is.number(min) || !is.number(max)))
    throw new Error(`${operator} needs two numbers to compare`)

  if (!isBetween && !is.number(value))
    throw new Error(`${operator} needs one number to compare`)

  return { operator, min, max, value }

}

/******************************************************************************/
// Main
/******************************************************************************/

function propToRangeAssert (prop) {

  const isExplicitObject = is.plainObject(prop)

  const propConfigurer = is.func(this)
    ? this
    : defaultRangeConfig

  const { err, operator, ...numbers } = propConfigurer(prop)

  const config = isExplicitObject
    ? checkExplicitConfig(operator, numbers)
    : fixImplicitConfig(operator, numbers)

  config.err = err

  return getAsserter(config)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default propToRangeAssert

export { RANGE_LAYOUT }
