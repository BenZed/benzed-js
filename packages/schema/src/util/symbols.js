/******************************************************************************/
// Symbols
/******************************************************************************/

const DEFINITION = Symbol('definition-used-by-this-validator')

const OPTIONAL_CONFIG = Symbol('this-validator-does-not-require-config')

const TYPE = Symbol('is-type-validator')

/******************************************************************************/
// Exports
/******************************************************************************/

export {
  OPTIONAL_CONFIG,
  DEFINITION,
  TYPE
}
