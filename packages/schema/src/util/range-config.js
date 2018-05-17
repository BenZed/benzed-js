import argsToConfig from '../util/args-to-config'
import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const OPERATORS = [ '>', '>=', '<=>', '<=', '<' ]

/******************************************************************************/
// Helper
/******************************************************************************/

const isNumber = num => is(num, Number)

/******************************************************************************/
// Comparer
/******************************************************************************/

const COMPARERS = {

  '>' (value, err) {
    const min = this
    return value > min
      ? value
      : handleError(err, 'greater than', min)
  },

  '>=' (value, err) {
    const min = this
    return value >= min
      ? value
      : handleError(err, 'equal to or greater than', min)
  },

  '<=>' (value, err) {
    const [ min, max ] = this
    return value >= min && value <= max
      ? value
      : handleError(err, 'between', min, max)
  },

  '<=' (value, err) {
    const max = this
    return value <= max
      ? value
      : handleError(err, 'equal to less than', max)
  },

  '<' (value, err) {
    const max = this
    return value < max
      ? value
      : handleError(err, 'less than', max)
  }

}

function handleError (err = defaultError, diff, ...values) {
  const msg = is(err, String)
    ? err
    : err || defaultError(diff, ...values)

  return new Error(msg)
}

function defaultError (diff, ...values) {
  return `must be ${diff} ${values.join(' and ')}`
}

function getComparer ({ operator, value, min, max }) {

  const num = operator === '<=>'
    ? [min, max]
    : value

  return num::COMPARERS[operator]
}

/******************************************************************************/
// Config
/******************************************************************************/

const operatorConfig = argsToConfig([
  {
    name: 'operator',
    test: value => OPERATORS.includes(value),
    default: '<=>'
  },
  {
    name: 'err',
    type: [String, Function],
    test: value => !OPERATORS.includes(value)
  },
  {
    name: 'min',
    type: Number
  },
  {
    name: 'max',
    type: Number
  },
  {
    name: 'value',
    type: Number
  }
])

function checkExplicitConfig (operator, numbers) {

  const isBetween = operator === '<=>'
  if (isBetween === isNumber(numbers.value))
    throw new Error(`value must ${isBetween ? 'not ' : ''}be defined for ${operator}`)

  if (isBetween !== isNumber(numbers.min) || isBetween !== !isNumber(numbers.max))
    throw new Error(`min and max must ${!isBetween ? 'not ' : ''}be defined for ${operator}`)

  if (isBetween && numbers.min > numbers.max)
    throw new Error(`min must be below max for ${operator}`)

  return getComparer({ operator, ...numbers })
}

function fixImplicitConfig (operator, numbers) {

  const isBetween = operator === '<=>'
  numbers = Object.values(numbers)
  numbers.sort()

  let min, max, value
  if (isBetween) {
    min = Math.min(numbers)
    max = Math.max(numbers)
  } else
    [ value ] = numbers.filter(isNumber)

  if (isBetween && (!isNumber(min) || !isNumber(max)))
    throw new Error(`${operator} needs two numbers to compare`)

  if (!isBetween && !isNumber(value))
    throw new Error(`${operator} needs one number to compare`)

  return getComparer({ operator, min, max, value })

}

/******************************************************************************/
// Main
/******************************************************************************/

const rangeConfig = (args) => {

  const isExplicitObject = args.length === 1 && is.plainObject(args[0])

  const { err, operator, ...numbers } = operatorConfig(args)
  if (operator in COMPARERS === false)
    throw new Error(`${operator} is not a valid comparer.`)

  const compare = isExplicitObject
    ? checkExplicitConfig(operator, numbers)
    : fixImplicitConfig(operator, numbers)

  return { compare, err }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default rangeConfig
