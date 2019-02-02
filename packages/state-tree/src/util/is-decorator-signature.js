import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const isDescription = obj =>
  is.plainObject(obj)

const isKey = [String, Symbol]::is

const isPrototype = obj => is.func(obj?.constructor)

/******************************************************************************/
// Main
/******************************************************************************/

/* eslint-disable no-multi-spaces */

const isDecoratorSignature = args =>

  args.length === 3 &&
  isPrototype(args[0]) &&
  isKey(args[1]) &&
  isDescription(args[2])

/******************************************************************************/
// Exports
/******************************************************************************/

export default isDecoratorSignature
