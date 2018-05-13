import { capitalize } from '@benzed/string'

export default ({ name, frontend, type, ui, api, pretty }) => ui && pretty`
import 'normalize.css'
import './public/${name}.css'

/******************************************************************************/
// Dynamic Dependencies
/******************************************************************************/

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('../ui/root')
])

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', async () => {
  const [
    { default: React },
    { ${api ? 'hydrate' : 'render'} },
    { default: ${frontend::capitalize()} }
  ] = await dependencies

  const tag = document.getElementById('${name}')
  const element = <${frontend::capitalize()} />

  ${api ? 'hydrate' : 'render'}(element, tag)
})
`

export function dependencies ({ ui }) {
  return ui && [
    'react',
    'react-dom'
  ]
}
