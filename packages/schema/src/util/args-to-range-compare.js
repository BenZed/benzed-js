import argsToConfig from '../util/args-to-config'
import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const OPERATORS = [ '>', '>=', '<=>', '<=', '<' ]

/******************************************************************************/
// Comparer
/******************************************************************************/

const COMPARERS = {

  '>' (value) {
    const [ min, err ] = this
    return value > min
      ? value
      : handleError(err, 'greater than', min)
  },

  '>=' (value) {
    const [ min, err ] = this
    return value >= min
      ? value
      : handleError(err, 'equal to or greater than', min)
  },

  '<=>' (value) {
    const [ min, max, err ] = this

    return value >= min && value < max
      ? value
      : handleError(err, 'between', min, max)
  },

  '<=' (value) {
    const [ max, err ] = this
    return value <= max
      ? value
      : handleError(err, 'equal to less than', max)
  },

  '<' (value) {
    const [ max, err ] = this
    return value < max
      ? value
      : handleError(err, 'less than', max)
  }

}

function handleError (err = defaultError, diff, ...values) {
  const msg = is(err, String)
    ? err
    : (err || defaultError)(diff, ...values)

  return new Error(msg)
}

function defaultError (diff, ...values) {
  return `must be ${diff} ${values.join(' and ')}`
}

function getComparer ({ operator, value, min, max, err }) {

  const num = operator === '<=>'
    ? [min, max, err]
    : [value, err]

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
    test: [[String, Function]::is, value => !OPERATORS.includes(value)]
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
])

function checkExplicitConfig (operator, numbers) {

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

  const isBetween = operator === '<=>'
  numbers = Object
    .values(numbers)
    .filter(is.number)

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

const argsToRangeCompare = args => {

  if (!is(args, Array))
    throw new Error('arsgToRangeCompare expects an array of arguments')

  const isExplicitObject = args.length === 1 && is.plainObject(args[0])

  const { err, operator, ...numbers } = operatorConfig(args)
  if (operator in COMPARERS === false)
    throw new Error(`${String(operator)} is not a valid operator`)

  const config = isExplicitObject
    ? checkExplicitConfig(operator, numbers)
    : fixImplicitConfig(operator, numbers)

  config.err = err

  return getComparer(config)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default argsToRangeCompare
