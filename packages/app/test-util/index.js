import testClient from './test-client'
import {
  TestApp,
  createProjectAppAndTest,
  createProjectHtml,
  createProjectConfigJson,

  TEMP_DIR
} from './test-project'

import { addPath } from 'module-alias'
import { clearConsole } from '@benzed/dev'
import path from 'path'

/******************************************************************************/
//
/******************************************************************************/

/******************************************************************************/
// Setup
/******************************************************************************/

addPath(path.join(__dirname, '../'))
clearConsole()
// TODO
// create Webpacked versions of ui's built to test
/******************************************************************************/
// Exports
/******************************************************************************/

export {

  testClient,

  TestApp,
  createProjectAppAndTest,
  createProjectHtml,
  createProjectConfigJson,

  TEMP_DIR
}
