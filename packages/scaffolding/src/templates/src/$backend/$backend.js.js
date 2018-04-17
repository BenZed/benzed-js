
export default ({ has, iff, Backend, backend, projectName }) => has.api && `

import App from '@benzed/app'

/******************************************************************************/
// Main
/******************************************************************************/

class ${Backend} extends App {

  ${iff(has.socketio)`socketio = true`}

  ${iff(has.rest)`rest = true`}

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${Backend}
`
