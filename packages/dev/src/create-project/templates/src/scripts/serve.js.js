import { toCamelCase, capitalize } from '@benzed/string'

export default ({ api, backend, name, pretty }) => {

  const className = `${name}-${backend}`::toCamelCase()::capitalize()

  const instanceName = name::toCamelCase()

  return api && `import ${className} from '../api/${backend}'
import path from 'path'

/******************************************************************************/
// Setup
/******************************************************************************/

const CONFIG_URL = path.resolve(__dirname, '../../config')

/******************************************************************************/
// Execute
/******************************************************************************/

// eslint-disable-next-line wrap-iife
void async function () {

  const ${instanceName} = new ${className}(CONFIG_URL)

  await ${instanceName}.initialize()

  try {
    await ${instanceName}.start()
  } catch (err) {
    console.error(err.message)
  }

}()
`
}
