import { Context } from './util'

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
    ? new Error(`${propName} in ${componentName} failed validation: ${result.message}`)
    : null

}

/******************************************************************************/
// Main
/******************************************************************************/

function PropTypeSchema (object) {

  const output = {}

  for (const key in object) {
    const validator = object[key]
    output[key] = validator::propCheck
  }

  return output

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default PropTypeSchema
