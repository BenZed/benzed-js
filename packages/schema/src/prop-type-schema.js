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
 * PropTypeSchema - Description
 *
 * @param {type} object Description
 *
 * @return {type} Description
 */
function PropTypeSchema (object) {

  if (!is.objectOf.func(object))
    throw new Error('PropTypeSchema must be defined with an object of validators.')

  const output = {}

  for (const key in object) {
    const validator = object[key]
    output[key] = normalizeValidator(validator)::propCheck
  }

  return output

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default PropTypeSchema
