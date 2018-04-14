import is from 'is-explicit'

/******************************************************************************/
// TODO seperate to own file
/******************************************************************************/

/* global describe */

const SKIP = Symbol('skip')
const ONLY = Symbol('only')

function getDescriberOf (operator) {

  if (operator === SKIP)
    return (...args) => describe.skip(...args)

  if (operator === ONLY)
    return (...args) => describe.only(...args)

  return describe
}

/******************************************************************************/
// Main
/******************************************************************************/

function testOptionallyBindableMethod (method, test, name) {

  if (!is(method, Function) || !is(test, Function))
    throw new Error('testOptionallyBindableMethod() requires a method to test and a test function.')

  const MOCHA_OPERATOR = this
  const describer = getDescriberOf(MOCHA_OPERATOR)

  const bound = (obj, ...args) => obj::method(...args)
  const arg = (obj, ...args) => method(obj, ...args)

  name = name || method.name || 'method'

  describer(`${name}()`, () => {
    describer(`bound syntax obj::${name}(...args)`, function () { return this::test(bound) })
    describer(`bound syntax ${name}(obj, ...args)`, function () { return this::test(arg) })
  })

}

/******************************************************************************/
// Extend
/******************************************************************************/

testOptionallyBindableMethod.skip = SKIP::testOptionallyBindableMethod

testOptionallyBindableMethod.only = ONLY::testOptionallyBindableMethod

/******************************************************************************/
// Exports
/******************************************************************************/

export default testOptionallyBindableMethod
