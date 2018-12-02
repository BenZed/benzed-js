import testOptionallyBindableMethod from './test-optionally-bindable-method'
import testPackageOutput from './test-package-output'
import testPropTypes from './test-prop-types'
import TestClient from './test-client'
import TestApi from './test-api'

import expectReject from './expect-reject'
import expectResolve from './expect-resolve'
import expectStyleRules from './expect-style-rules'

/******************************************************************************/
// Test Object
/******************************************************************************/

const Test = {
  optionallyBindableMethod: testOptionallyBindableMethod,
  packageOutput: testPackageOutput,
  propTypes: testPropTypes,
  Api: TestApi,
  Client: TestClient
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Test

export {
  testOptionallyBindableMethod,
  testPackageOutput,
  testPropTypes,
  TestClient,
  TestApi,

  expectReject,
  expectResolve,
  expectStyleRules
}
