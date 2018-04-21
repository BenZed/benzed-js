import is from 'is-explicit'
import { ValidationError, SKIP, SELF } from './util'

/******************************************************************************/
// Main
/******************************************************************************/

function validate (funcs, input, context) {

  let output

  if (funcs instanceof Array) for (const func of funcs) {

    const result = func(input, context)
    if (result === SKIP)
      break

    if (result instanceof Error)
      throw new ValidationError(context.path, result.message)

    output = result

  } else { // otherwise it will be an object

    if (SELF in funcs)
      input = validate(funcs[SELF], input, context)

    if (is.plainObject(input)) for (const key in funcs) {

      context.path = [ ...context.path, key ]

      const result = validate(
        funcs[key],
        input[key],
        context
      )

      if (result === undefined)
        continue

      output = output || {}
      output[key] = result

    }

  }

  return output

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validate
