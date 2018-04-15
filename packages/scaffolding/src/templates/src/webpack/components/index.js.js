
export default ({ Frontend, has }) => has.ui && `

import ${Frontend} from './${Frontend}'

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${Frontend}
`
