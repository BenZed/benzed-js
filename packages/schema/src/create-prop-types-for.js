import createValidator from './create-validator'

// What's this?

// Well, @benzed/schema should be able to be used to make prop-types
// for React Components.

// Problem is, you can't have two types of JSX syntaxes in the same
// file. So you can either declare your prop types in a seperate file
// or use this helper function, which provides a fake React.createElement
// that actually points to Schema.createValidator

/******************************************************************************/
// Helper
/******************************************************************************/

const convertSchemaToPropTypes = schema => {

  const proptypes = null // {}

  // TODO implement
  // 1) assert that schema is an Schema.ObjectType
  // 2) take each of the children in schema.children and wrap them in a function
  //    that returns null (for validation passed) or an error if validation failed
  // 3) take each of the wrapped children and return them as keys to the proptypes
  //    object

  if (!convertSchemaToPropTypes.warned) {
    convertSchemaToPropTypes.warned = true
    console.warn(
      'createPropTypesFor not yet implemented. Checks the schema for errors and' +
      ' then just returns null.'
    )
  }

  // TODO also, for this to work, Schemas need to be able to turn off data
  // sanitizaitons. PropTypes can't mutate data like validators can, so all of the
  // stock validators that mutate need to be able to turn that behaviour off

  return proptypes
}

/******************************************************************************/
// Main
/******************************************************************************/

function createPropTypesFor (createSchemaFunc) {

  // if this func is bound, we'll forward that behaviour
  // to binding
  const altResolveCompiler = this
  const createElement = altResolveCompiler
    ? altResolveCompiler::createValidator
    : createValidator

  const fakeReact = { createElement }

  const schema = createSchemaFunc(fakeReact)
  const proptypes = convertSchemaToPropTypes(schema)

  return proptypes
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createPropTypesFor
