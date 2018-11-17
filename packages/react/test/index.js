import { clearConsole } from '@benzed/dev'

import { addPath } from 'module-alias'
import path from 'path'
import createTestApi from './create-test-api'

import 'styled-components-test-utils/lib/chai'
import 'colors'

/******************************************************************************/
// Global
/******************************************************************************/

// TEMP this should be replaced with our jsx app markup that will exist in @benzed/dev
global.createTestApi = createTestApi

/******************************************************************************/
// Execute
/******************************************************************************/

clearConsole()
addPath(path.resolve(__dirname, '../'))

/******************************************************************************/
// Export
/******************************************************************************/
