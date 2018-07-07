/******************************************************************************/
// Data
/******************************************************************************/

const STACK = Symbol('stack-of-style-methods')

const STYLE = Symbol('create-style-value-from-stack-methods')

/******************************************************************************/
// Style Functions
/******************************************************************************/

function propWithName (value, props) {

  const name = this

  return props[name]
}

function mutateValue (value, props) {

  const mutator = this

  return mutator(value, props)

}

/******************************************************************************/
// Main
/******************************************************************************/

class Styler {

  [STACK] = [];

  [STYLE] (props) {

    let value

    for (const func of this[STACK])
      value = func(value, props)

    return value
  }

  prop (name) {

    this[STACK].push(name::propWithName)

    return this
  }

  mut (mutator) {
    this[STACK].push(mutator::mutateValue)

    return this
  }

  toString () {
    return this.valueOf()
  }

  valueOf () {
    return ::this[STYLE]
  }

}

const $ = {}

/******************************************************************************/
// Interface
/******************************************************************************/

// function extendWithTheme (theme) {
//
//   const ExtendedStyler = class extends Styler {}
//
//   for (const key in theme) {
//     const property = theme[key]
//   }
//
// }

/******************************************************************************/
// Exports
/******************************************************************************/

export default $

export {
  Styler
}
