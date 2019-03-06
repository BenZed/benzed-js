import { get, push } from '@benzed/immutable'

import basicTheme from '../themes/basic'
import is from 'is-explicit'

import Color from '../themes/color'

/******************************************************************************/
// DATA
/******************************************************************************/

const $$stack = Symbol('stack-of-style-methods-and-params')
const $$style = Symbol('create-style-value-from-stack-methods')

const $$if = Symbol('stack-flow-control-if')
const $$or = Symbol('stack-flow-control-or')
const $$else = Symbol('stack-flow-control-else')

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

  const target = props || value

  const theme = target.theme
  // TODO only props prefixed with $ should be stylable
  const brand = target.brand || target.$brand

  return brand && theme?.brand?.[brand]
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

    this[$$stack].push(getPropAtPath, path)

    return this
  }

  mut (mutator) {

    if (!is.func(mutator))
      throw new Error('Mutator must be a function.')

    this[$$stack].push(applyMutator, mutator)

    return this
  }

  set (value) {

    this[$$stack].push(setValue, value)
    return this
  }

  // Flow control

  if (predicate) {

    if (!is.func(predicate))
      throw new Error('must be a predicate function')

    this[$$stack].push($$if, predicate)
    return this
  }

  ifProp (...args) {

    const isPath = is.arrayOf(args, [ String, Number ])
    if (!isPath)
      throw new Error('must be a path to a prop')

    const predicate = getPropAtPath.bind(null, args)
    return this.if(predicate)
  }

  get ifBranded () {

    const predicate = getBrandedValue
    return this.if(predicate)
  }

  get or () {
    this[$$stack].push($$or)

    return this
  }

  get else () {

    const { funcs } = this[$$stack]

    let count = 0
    for (let i = 0; i < funcs.length; i++) {
      const func = funcs[i]
      if (func === $$if)
        count++
      else if (func === $$else)
        count--
    }

    if (count <= 0)
      throw new Error('Can\'t stack else, must come after if.')

    this[$$stack].push($$else)
    return this
  }

  // Color Manipulators

  fade (amount) {

    this[$$stack].push(alterColor, ['fade', amount])
    return this
  }

  darken (amount) {

    this[$$stack].push(alterColor, ['darken', amount])
    return this
  }

  lighten (amount) {

    this[$$stack].push(alterColor, ['lighten', amount])
    return this
  }

  desaturate (amount) {

    this[$$stack].push(alterColor, ['desaturate', amount])
    return this
  }

  get branded () {

    this[$$stack].push(getBrandedValue)

    return this
  }

  // Style Compilation

  toString () {
    return this[$$style]
  }

  valueOf () {
    return this[$$style]
  }

  [$$style] = props => {

    let value
    let waitForElse = 0

    const { funcs, params } = this[$$stack]

    for (let i = 0; i < funcs.length; i++) {
      const func = funcs[i]
      const param = params[i]

      const isElse = func === $$else
      const isIf = func === $$if
      const isOr = func === $$or

      if (!isElse && waitForElse > 0) {
        waitForElse += isIf
          ? 1
          : 0
        continue
      }

      if (isOr && is.defined(value))
        break

      if (isElse && --waitForElse < 0)
        break

      if (isIf) {
        const predicate = param
        const result = predicate(value, props)
        waitForElse += result
          ? 0
          : 1
      }

      if (is.func(func))
        value = func(param, value, props)
    }

    return is.primitive(value)
      ? value
      : `${value}`
  }

  [$$stack] = {
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
