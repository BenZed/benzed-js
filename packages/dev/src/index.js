import testOptionallyBindableMethod from './test-optionally-bindable-method'
import testPackageOutput from './test-package-output'
import inspect from './inspect'

import WebpackConfig from './webpack-config'

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
  WebpackConfig,

  inspect,

  testOptionallyBindableMethod,
  testPackageOutput
}
