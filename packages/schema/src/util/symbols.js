/******************************************************************************/
// Symbols
/******************************************************************************/

const DEFINITION = Symbol('definition-used-by-this-validator')

const SELF = Symbol('validators-called-on-object-before-its-properties')

const OPTIONAL_CONFIG = Symbol('this-validator-does-not-require-config')

/******************************************************************************/
// Exports
/******************************************************************************/

export { SELF, OPTIONAL_CONFIG, DEFINITION }
