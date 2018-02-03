import is from 'is-explicit'
import { round } from 'math-plus'

/******************************************************************************/
// Data
/******************************************************************************/

const CAPS = /[A-Z]/
const FRIENDLY = /[a-z]|[0-9]|-|\./

const modresrem = (value, mod) => {
  const remainder = value % mod
  const result = (value - remainder) / mod

  return [result, remainder]
}

function zeros (args) {
  let num, size
  if (is(this, Number)) {
    ([ size ] = args)
    num = this
  } else
    ([ num, size ] = args)

  if (!is(size, Number) || size <= 0)
    throw new Error('size must be a number above zero')

  let str = num.toString()

  if (str.length < size)
    str = '0'.repeat(size - str.length) + str

  return str
}

/******************************************************************************/
// Exports
/******************************************************************************/

export function timecode (sec) {
  let min, hour

  [min, sec] = modresrem(round(sec), 60);
  [hour, min] = modresrem(min, 60) //eslint-disable-line

  const prettySec = zeros(sec, 2)
  const prettyHour = hour > 0 ? `${hour}:` : ''
  const prettyMin = prettyHour ? zeros(min, 2) : min

  return `${prettyHour}${prettyMin}:${prettySec}`
}

export function capitalize (str) {

  str = this || str
  if (!is(str, String))
    return undefined

  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function nicify (str) {

  str = this || str
  if (!is(str, String))
    return undefined

  return unCamelCase(str)
    .split('-')
    .map(str => capitalize(str))
    .join(' ')
}

export function unpattern (...args) {

  let str, pattern, replacer

  if (is(this, String)) {
    ([ pattern = /\s\s/g, replacer = ' ' ] = args)
    str = this
  } else
    ([ str, pattern = /\s\s/g, replacer = ' ' ] = args)

  if (!is(str, String))
    throw new Error('str must be a string')

  if (!is(pattern, RegExp))
    throw new Error('pattern must be a regexp')

  let last

  while (pattern.test(str)) {
    const was = str
    const now = str.replace(pattern, replacer)
    if (was === now || now === last)
      throw new Error('Replacer prevents pattern from being resolved:', pattern, replacer)

    last = was
    str = now
  }

  return str
}

export function friendly (str) {

  str = this || str
  if (!is(str, String))
    throw new Error('string must be a string')

  str = str.toLowerCase()
  let friendly = ''
  for (let i = 0, c = str[i]; i < str.length; c = str[++i])
    friendly += FRIENDLY.test(c) ? c : '-'

  friendly = unpattern(friendly, /--/, '-').replace(/^-|-$/, '')
  friendly = unpattern(friendly, /-\.|\.\./, '.')

  return friendly
}

export function camelCase (...args) {

  let str, limiter
  if (is(this, String)) {
    ([ limiter = '-' ] = args)
    str = this
  } else
    ([ str, limiter = '-' ] = args)

  if (!is(str, String))
    return undefined

  return str.split(limiter).map((str, i) => i === 0
    ? str
    : capitalize(str)
  ).join('')
}

export function unCamelCase (...args) {

  let str, limiter
  if (is(this, String)) {
    ([ limiter = '-' ] = args)
    str = this
  } else
    ([ str, limiter = '-' ] = args)

  if (!is(str, String))
    return undefined

  let cased = ''
  for (let i = 0, c = str[i]; i < str.length; c = str[++i])
    cased += CAPS.test(c)
      ? (i > 0 ? limiter : '') + c.toLowerCase()
      : c

  return unpattern(cased, /--/g, '-')
}
