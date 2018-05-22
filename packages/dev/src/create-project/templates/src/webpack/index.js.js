import { capitalize } from '@benzed/string'

export default ({ name, frontend, type, ui, api, iff, routing, pretty }) => ui && pretty`
import 'normalize.css'
import './public/${name}.css'

/******************************************************************************/
// Dynamic Dependencies
/******************************************************************************/

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('${iff(routing)`react-router-dom`}'),
  import('../ui/root')
])

/******************************************************************************/
// Helper
/******************************************************************************/

${iff(api)`function getServerProps () {

  let props
  try {

    const serverPropsTag = document.getElementById('${name}-server-props')

    props = JSON.parse(serverPropsTag.textContent)

    serverPropsTag.textContent = ''

  } catch (err) {
    // it could be that the server sent bad data, but generally any failure
    // will simply mean no data has been sent
  }

  // make double sure we're sending back an object
  return props !== null && typeof props === 'object'
    ? props
    : {}

}`}

function getMainTag () {
  return document.getElementById('${name}')
}

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', async () => {
  const [
    { default: React },
    { ${api ? 'hydrate' : 'render'} },
    { ${iff(routing)`BrowserRouter`} },
    { default: ${frontend::capitalize()} }
  ] = await dependencies

  ${iff(api)`const props = getServerProps()`}
  const main = getMainTag()

  const element = ${routing ? `<BrowserRouter>
    <${frontend::capitalize()} ${api ? '{...props} ' : ''}/>
  </BrowserRouter>`
    : `<${frontend::capitalize()} ${api ? '{...props} ' : ''}/>`
}

  ${api ? 'hydrate' : 'render'}(element, main)
})
`

export function dependencies ({ ui }) {
  return ui && [
    'react',
    'react-dom'
  ]
}
