import testOptionallyBindableMethod from './test-optionally-bindable-method'
import inspect from './inspect'
/******************************************************************************/
// Test Object
/******************************************************************************/

const Test = {
  optionallyBindableMethod: testOptionallyBindableMethod
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Test

export {
  Test,

  inspect,

  testOptionallyBindableMethod
}
