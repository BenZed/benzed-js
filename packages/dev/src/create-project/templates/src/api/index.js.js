import { capitalize } from '@benzed/string'

export default ({ api, pretty, backend }) => api && pretty`
import ${backend::capitalize()} from './${backend}'

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${backend::capitalize()}
`
