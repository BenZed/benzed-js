import typeOf from './type-of'

/******************************************************************************/
// Canned Types
/******************************************************************************/

const string = typeOf(String)
const number = typeOf(Number)
const symbol = typeOf(Symbol)
const func = typeOf(Function)
const bool = typeOf(Boolean)

/******************************************************************************/
// Exports
/******************************************************************************/

export {
  typeOf,
  string,
  number,
  symbol,
  func,
  bool
}
