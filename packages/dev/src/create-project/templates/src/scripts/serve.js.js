import { toCamelCase, capitalize } from '@benzed/string'

export default ({ api, backend, name, pretty }) => {

  const className = `${name}-${backend}`::toCamelCase()::capitalize()

  return api && `import ${className} from '../api'
import path from 'path'

/******************************************************************************/
// Setup
/******************************************************************************/

const CONFIG_URL = path.resolve(process.cwd(), 'config')

/******************************************************************************/
// Execute
/******************************************************************************/

${className}.run(CONFIG_URL)
`
}
