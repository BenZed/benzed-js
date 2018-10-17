import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const SCHEMA = Symbol('schema-data')

/******************************************************************************/
// Main
/******************************************************************************/

function isSchema (input) {
  if (this !== undefined)
    input = this

  return is.object(input) && is.plainObject(input[SCHEMA])
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isSchema

export {
  SCHEMA
}
