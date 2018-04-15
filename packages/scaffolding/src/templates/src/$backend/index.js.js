
export default ({ Backend, backend, has }) => has.api && `

import ${Backend} from './${backend}'

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${Backend}`
