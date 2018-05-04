import ValidationError from './util/validation-error'

import { wrap } from '@benzed/array'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function handleError (ctx, err) {

  const vErr = new ValidationError(ctx.path, err.message)

  if (ctx.throw)
    throw vErr
  else
    return vErr
}

function validateAll (validators, value, context, index = 0) {

  for (let i = index; i < validators.length; i++) {

    const validator = validators[i]
    let result

    try {
      result = validator(value, context)
    } catch (err) {
      result = err
    }

    if (result instanceof Error)
      return handleError(context, result)

    if (result instanceof Promise)
      return result
        .then(value => validateAll(validators, value, context, i + 1))
        .catch(err => handleError(context, err))

    value = result
  }

  return value

}

/******************************************************************************/
// Main
/******************************************************************************/

function validate (validator, input, context) {

  const validators = wrap(validator)

  return is(input, Promise)
    ? input.then(resolvedInput => validateAll(validators, resolvedInput, context))

    : validateAll(validators, input, context)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validate

export { validate }
