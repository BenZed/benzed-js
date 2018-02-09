
/******************************************************************************/
// Symbols for pseudo javascript valuetype operators
/******************************************************************************/

const copy = Symbol('=')

const equals = Symbol('===')

const add = Symbol('+')

const subtract = Symbol('-')

const multiply = Symbol('*')

const divide = Symbol('/')

const VALUE = Object.freeze({
  copy, equals, add, subtract, multiply, divide
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default VALUE

export {
  VALUE,
  equals, add, subtract, multiply, divide
}
