import testOptionallyBindableMethod from './test-optionally-bindable-method'
import testPackageOutput from './test-package-output'

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
  testOptionallyBindableMethod,
  testPackageOutput
}
