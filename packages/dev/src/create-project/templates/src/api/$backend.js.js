import { toCamelCase, capitalize } from '@benzed/string'

export default ({ api, auth, files, name, backend, iff, pretty }) => {

  const className = `${name + '-' + backend}`::toCamelCase()::capitalize()

  const importNames = [
    auth && 'users',
    files && 'files'
  ].filter(n => n)

  const serviceImport = importNames.length > 0
    ? '{ ' + importNames.join(', ') + ' }'
    : '* as services'

  return api && pretty`
import { App } from '@benzed/app'
import ${serviceImport} from './services'

/******************************************************************************/
// App
/******************************************************************************/

class ${className} extends App {

  services = {
    ${importNames.join(',\n    ')}
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${className}
`
}
