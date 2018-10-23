import { clearConsole } from '../src'
import { addPath } from 'module-alias'
import path from 'path'
import 'colors'

/******************************************************************************/
// Setup
/******************************************************************************/

addPath(path.join(__dirname, '../'))
clearConsole()
