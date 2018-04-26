import { ZERO_CONFIG, SELF } from '../util'
import Schema from '../Schema'
import is from 'is-explicit'

/******************************************************************************/
// Config
/******************************************************************************/

const cast = config => {

  if (!is(config))
    config = 'is Required.'

  if (is(config, String))
    config = { err: config }

  if (!is.plainObject(config))
    return new Error('required validator must be given a string or object')

  return config
}

const errString = err => is(err, String) && err.length > 0
  ? err
  : new Error('must be a non-empty string.')

const validateConfig = Schema({
  [SELF]: cast,
  err: errString
})

/******************************************************************************/
// Main
/******************************************************************************/

function required (config) {

  config = validateConfig(config)

  return value => is(value)
    ? value
    : new Error(config.err)
}

required[ZERO_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default required
