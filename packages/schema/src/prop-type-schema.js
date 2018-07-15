import Context from './util/context'
import normalizeValidator from './util/normalize-validator'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function propCheck (props, propName, componentName = 'Anonymous Component') {

  const validator = this

  const result = validator(
    props[propName],
    new Context(props, [ propName, componentName ], [ propName ])
  )

  return result instanceof Error
    ? new Error(`'${propName}' in <${componentName}/>: '${result.message}'`)
    : null

}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Constructor for creating propType definitions with @benzed/schema
 *
 * @param {Object} input Object of functions, with keys as props.
 *
 * @return {Object} Output propTypes.
 */
function PropTypeSchema (input) {

  if (!is.objectOf.func(input))
    throw new Error('PropTypeSchema must be defined with an object of validators.')

  const output = {}

  for (const key in input) {
    const validator = input[key]
    output[key] = normalizeValidator(validator)::propCheck
  }

  return output
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default PropTypeSchema
