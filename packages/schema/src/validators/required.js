import { argsToConfig, OPTIONAL_CONFIG } from '../util'
import is from 'is-explicit'

/******************************************************************************/
// Config
/******************************************************************************/

const nonEmpty = err => is(err, String) && err.length > 0
  ? err
  : new Error('must be a non-empty string.')

const configRequired = argsToConfig({
  name: 'err',
  type: String,
  default: 'is Required.',
  validate: nonEmpty
})

/******************************************************************************/
// Main
/******************************************************************************/

function required (...args) {

  const { err } = configRequired(args)

  const required = value => is(value)
    ? value
    : new Error(err)

  return required
}

required[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default required
