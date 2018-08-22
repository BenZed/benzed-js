import { get, push } from '@benzed/immutable'

import basicTheme from '../themes/basic'
import is from 'is-explicit'

import Color from '../themes/color'

/******************************************************************************/
// DATA
/******************************************************************************/

const STACK = Symbol('stack-of-style-methods-and-params')

const STYLE = Symbol('create-style-value-from-stack-methods')

const IF = Symbol('stack-flow-control-if')

const ELSE = Symbol('stack-flow-control-else')

/******************************************************************************/
// Stack Functions
/******************************************************************************/

function getPropAtPath (path, value, props) {
  return get.mut(props, path)
}

function applyMutator (mutator, value, props) {
  return mutator(value, props)
}

function getBrandedValue (_param, value, props) {
  const { brand, theme } = props
  return brand && theme.brand && theme.brand[brand]
}

function setValue (value) {
  return value
}

function alterColor ([alterMethodName, ...args], value, props) {
  return is(value, Color)
    ? value[alterMethodName](...args)
    : value
}

/******************************************************************************/
// Helper
/******************************************************************************/

function buildTheme (styler, theme, path = [ 'theme' ]) {

  const _interface = {}

  for (const key in theme) {
    const value = theme[key]

    const description = {
      enumerable: true,
      configurable: false
    }

    const nextPath = path::push(key)

    if (is.plainObject(value))
      description.value = buildTheme(styler, value, nextPath)
    else
      description.get = () => styler.prop(...nextPath)

    Object.defineProperty(
      _interface,
      key,
      description
    )
  }

  return _interface

}

function extendStylerWithTheme (Styler, theme) {

  class ThemedStyler extends Styler {

    theme () {}

    constructor (...args) {
      super(...args)

      this.theme = buildTheme(this, theme)

    }
  }

  return ThemedStyler
}

function StylerInterface (Styler) {

  if (this instanceof StylerInterface === false)
    return new StylerInterface(Styler)

  const names = new Set()

  let { prototype } = Styler
  while (prototype !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(prototype))
      if (name in this === false)
        names.add(name)

    prototype = Object.getPrototypeOf(prototype)
  }

  for (const name of names)
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: false,
      get () {
        const styler = new Styler()
        const value = styler[name]
        return is.func(value)
          ? styler::value
          : value
      }
    })

}

/******************************************************************************/
// Main
/******************************************************************************/

class Styler {

  static createInterface (theme) {

    const styler = theme
      ? extendStylerWithTheme(this, theme)
      : this

    return new StylerInterface(styler, theme)
  }

  // Style Manipulators

  prop (...path) {

    if (path.length === 0)
      throw new Error('Provide at least one string argument as a path.')

    if (!path.every(is.string))
      throw new Error('Path arguments must all be strings.')

    this[STACK].push(getPropAtPath, path)

    return this
  }

  mut (mutator) {

    if (!is.func(mutator))
      throw new Error('Mutator must be a function.')

    this[STACK].push(applyMutator, mutator)

    return this
  }

  set (value) {
    this[STACK].push(setValue, value)

    return this
  }

  // Flow control

  if (...args) {

    const isFunc = args.length === 1 && is.func(args[0])
    const isPath = !isFunc && is.arrayOf.string(args)
    // if (!isFunc && !isPath)
    //   throw new Error('must be a predicate function or a path to a prop')

    const predicate = isPath
      ? getPropAtPath.bind(null, args)
      : null

    this[STACK].push(IF, predicate)

    return this
  }

  get else () {

    this[STACK].push(ELSE)

    return this
  }

  // Color Manipulators

  fade (amount) {

    this[STACK].push(alterColor, ['fade', amount])

    return this
  }

  darken (amount) {
    this[STACK].push(alterColor, ['darken', amount])

    return this
  }

  lighten (amount) {
    this[STACK].push(alterColor, ['lighten', amount])

    return this
  }

  get branded () {

    this[STACK].push(getBrandedValue)

    return this
  }

  // Style Compilation

  toString () {
    return this[STYLE]
  }

  valueOf () {
    return this[STYLE]
  }

  [STYLE] = props => {

    let value

    const { funcs, params } = this[STACK]

    let waitUntilElse = false
    for (let i = 0; i < funcs.length; i++) {
      const func = funcs[i]
      const param = params[i]

      const isElse = func === ELSE

      if (waitUntilElse && !isElse)
        continue

      else if (isElse && !waitUntilElse)
        break

      else if (isElse && waitUntilElse)
        waitUntilElse = false

      else if (func === IF) {
        const predicate = param
        waitUntilElse = !predicate(value, props)

      } else
        value = func(param, value, props)
    }

    return is.primitive(value)
      ? value
      : `${value}`
  }

  [STACK] = {
    funcs: [],
    params: [],
    push (func, param) {
      this.funcs.push(func)
      this.params.push(param)
    }
  }
}

/******************************************************************************/
// Basic Theme Interface
/******************************************************************************/

const $ = Styler.createInterface(basicTheme)

/******************************************************************************/
// Exports
/******************************************************************************/

export default Styler

export {
  Styler,
  $
}
