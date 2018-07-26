import { toCamelCase, capitalize } from '@benzed/string'

export default ({ api, auth, files, name, backend, iff, pretty }) => {

  const className = `${name + '-' + backend}`::toCamelCase()::capitalize()

  return api && pretty`
import { App } from '@benzed/app'
import * as services from './services'

/******************************************************************************/
// App
/******************************************************************************/

class ${className} extends App {

  services = services

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${className}
`
}
