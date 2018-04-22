import is from 'is-explicit'
import getDescriber from './get-describer'

/******************************************************************************/
// Main
/******************************************************************************/

function testOptionallyBindableMethod (method, test, name) {

  if (!is(method, Function) || !is(test, Function))
    throw new Error('testOptionallyBindableMethod() requires a method to test and a test function.')

  const describer = getDescriber(this)

  const bound = (obj, ...args) => obj::method(...args)
  const arg = (obj, ...args) => method(obj, ...args)

  name = name || method.name || 'method'

  describer(`${name}()`, () => {
    describer(`bound syntax obj::${name}(...args)`, function () { return this::test(bound) })
    describer(`bound syntax ${name}(obj, ...args)`, function () { return this::test(arg) })
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(testOptionallyBindableMethod)
