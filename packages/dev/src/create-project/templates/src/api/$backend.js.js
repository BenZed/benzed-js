import { toCamelCase, capitalize } from '@benzed/string'

export default ({ api, name, backend, pretty }) => {

  const className = `${name + '-' + backend}`::toCamelCase()::capitalize()

  return api && pretty`
import { App } from '@benzed/app'

/******************************************************************************/
// App
/******************************************************************************/

class ${className} extends App {

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${className}
`
}
