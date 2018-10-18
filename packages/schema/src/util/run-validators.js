import is from 'is-explicit'
import ValidationError from './validation-error'

/******************************************************************************/
// Helper
/******************************************************************************/

const handleError = (err, value, context) => {

  throw is(err, ValidationError) || !context
    ? err
    : new ValidationError(err.message, value, context.path)

}

/******************************************************************************/
// Main
/******************************************************************************/

const runValidators = (validators, data, context, index = 0) => {

  let output = data

  for (let i = index; i < validators.length; i++) {

    const validator = validators[i]
    let result

    try {
      result = validator(output, context)
    } catch (err) {
      return handleError(err, output, context)
    }

    if (is(result, Promise))
      return result
        .then(resolved => runValidators(
          validators, resolved, context, i + 1
        ))
        .catch(err => handleError(err, output, context))

    else
      output = result
  }

  return output
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default runValidators
