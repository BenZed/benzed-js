import { clearConsole } from '@benzed/dev'
import { addPath } from 'module-alias'
import path from 'path'

/******************************************************************************/
// EXecute
/******************************************************************************/

clearConsole()
addPath(path.resolve(__dirname, '../'))

if (process.env.NODE_ENV !== 'test')
  process.env.NODE_ENV = 'test'

/******************************************************************************/
// Export
/******************************************************************************/
