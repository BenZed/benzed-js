import is from 'is-explicit'
// import Context from './context'

/******************************************************************************/
// Helper
/******************************************************************************/

const throwAny = err => throw err

const runValidators = (
  validators,
  data,
  context = null, // new Context(),
  index = 0
) => {

  let output = data

  for (let i = index; i < validators.length; i++) {

    const validator = validators[i]

    const result = validator(output, context)
    if (is(result, Promise))
      return result
        .then(resolved => runValidators(validators, resolved, context, i + 1))
        .catch(throwAny)

    else
      output = result
  }

  return output
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default runValidators
