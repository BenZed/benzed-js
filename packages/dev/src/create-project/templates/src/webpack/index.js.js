import { capitalize } from '@benzed/string'

export default ({ name, frontend, type, ui, pretty }) => {

  return ui && pretty`import 'normalize.css'
import './public/${name}.css'

/******************************************************************************/
// Dynamic Dependencies
/******************************************************************************/

const dependencies = Promise.all([
  import('@benzed/react'),
  import('ui/components/${frontend}')
])

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', async () => {
  const [
    { React, render },
    { default: ${frontend::capitalize()} }
  ] = await dependencies

  const tag = document.getElementById('${name}')
  const element = <${frontend::capitalize()} />

  render(element, tag)
})
`
}
