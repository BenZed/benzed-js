import { OPTIONAL_CONFIG } from '../util/symbols'
import argsToConfig from '../util/args-to-config'
import is from 'is-explicit'

/******************************************************************************/
// Config
/******************************************************************************/

const nonEmpty = err => is(err, String) && err.length > 0
  ? err
  : new Error('must be a non-empty string.')

const configRequired = argsToConfig({
  name: 'err',
  test: is.string,
  default: 'is Required.',
  validate: nonEmpty
}, 'required')

/******************************************************************************/
// Main
/******************************************************************************/

function required (...args) {

  const { err } = configRequired(args)

  const required = value => is.defined(value)
    ? value
    : new Error(err)

  return required
}

required[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default required
