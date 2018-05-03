/******************************************************************************/
// Symbols
/******************************************************************************/

const DEFINITION = Symbol('definition-used-by-this-validator')

const OPTIONAL_CONFIG = Symbol('this-validator-does-not-require-config')

const TYPE = Symbol('is-type-validator')

const TYPE_TEST_ONLY = Symbol('skip-cast-in-type-validator')

// const ACCEPTS_NOTHING = Symbol('validator-accepts-null-or-undefined')

/******************************************************************************/
// Exports
/******************************************************************************/

export {
  OPTIONAL_CONFIG,
  DEFINITION,
  TYPE,
  TYPE_TEST_ONLY
}
