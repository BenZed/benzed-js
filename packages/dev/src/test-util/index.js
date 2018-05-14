import testOptionallyBindableMethod from './test-optionally-bindable-method'
import testPackageOutput from './test-package-output'

import expectReject from './expect-reject'
import expectResolve from './expect-resolve'

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
  testPackageOutput,

  expectReject,
  expectResolve
}
