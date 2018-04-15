import testOptionallyBindableMethod from './test-optionally-bindable-method'
import testPackageOutput from './test-package-output'
import inspect from './inspect'

/******************************************************************************/
// Test Object
/******************************************************************************/

const Test = {
  optionallyBindableMethod: testOptionallyBindableMethod,
  packageOutput: testPackageOutput
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Test

export {
  Test,

  inspect,

  testOptionallyBindableMethod,
  testPackageOutput
}
