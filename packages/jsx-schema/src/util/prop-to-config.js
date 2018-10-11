import is from 'is-explicit'

import { pluck, wrap } from '@benzed/array'
import { copy, push, unshift } from '@benzed/immutable'

import runValidators from './run-validators'

/******************************************************************************/
// Validation
/******************************************************************************/

function wrapIfMany (value) {

  const layout = this
  const many = layout.count > 1

  return many
    ? wrap(value).filter(is.defined)
    : value
}

function setDefault (value) {

  const layout = this
  const many = layout.count > 1
  const defined = many
    ? value.length > 0
    : is.defined(value)

  return !defined && is.defined(layout.default)
    ? many
      ? wrap(layout.default)
      : layout.default

    : value
}

function mustPassTest (value) {

  const layout = this
  const many = layout.count > 1
  const defined = many
    ? value.length > 0
    : is.defined(value)

  const invalid = many
    ? defined && !value.every(v => layout.test(v))
    : defined && !layout.test(value)

  if (invalid)
    throw new Error(`'${layout.name}' is invalid.`)

  return value
}

function checkIfRequired (value) {

  const layout = this
  const many = layout.count > 1
  const defined = many
    ? value.length > 0
    : is.defined(value)

  if (layout.required && !defined)
    throw new Error(`'${layout.name}' is required.`)

  return value
}

/******************************************************************************/
// Helper
/******************************************************************************/

function allPass (value) {

  const tests = this

  for (const test of tests)
    if (!test(value))
      return false

  return true
}

// Validations have to be written manually because Schema depends on it
function checkLayout (layout) {

  if (!is.plainObject(layout))
    throw new Error('each layout must be a plain object')

  layout = copy(layout)

  if (!is.string(layout.name))
    throw new Error('each layout must have a name')

  if (layout.name.length === 0)
    throw new Error('layout names must not be empty')

  const tests = wrap(layout.test).filter(is.func)
  if (tests.length === 0)
    throw new Error('each layout must have at least one test function')

  layout.test = tests.length === 1
    ? tests[0]
    : tests::allPass

  if (!is.number(layout.count))
    layout.count = 1

  layout.required = !!layout.required

  layout.validate = wrap(layout.validate)
    .filter(is.func)
    ::unshift(
      layout::wrapIfMany,
      layout::setDefault
    )
    ::push(
      layout::mustPassTest,
      layout::checkIfRequired
    )

  if (is.defined(layout.default) && !layout.test(layout.default))
    throw new Error('default layout values must pass test')

  return layout
}

/******************************************************************************/
// Main
/******************************************************************************/

function propToConfig (prop) {

  const layouts = this

  const isInputObject = is.plainObject(prop)
  const config = isInputObject
    ? prop
    : {}

  if (!isInputObject)
    prop = wrap(prop)
      .filter(is.defined)

  // fill config from non-object prop
  if (!isInputObject) for (const layout of layouts) {
    const { name, count, test } = layout

    const found = pluck(prop, test, count)
    if (found.length > 0)
      config[name] = count === 1
        ? found[0]
        : found
  }

  // validate config
  for (const { name, validate: validators } of layouts)
    config[name] = runValidators(validators, config[name])

  // in case a plain object was submitted, we remove keys that arn't
  // defined in the layout
  for (const key in config)
    if (!layouts.some(layout => layout.name === key))
      delete config[key]

  return config
}

/******************************************************************************/
// Factory
/******************************************************************************/

const propToConfigFactory = (...args) => {

  const layout = wrap(args[0])
    .map(checkLayout)

  if (layout.length < 1)
    throw new Error('must be at least one layout object')

  const prop = args[1]

  const propWasProvided = args.length > 1
  return propWasProvided
    ? layout::propToConfig(prop)
    : layout::propToConfig

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default propToConfigFactory
