
import { capitalize } from '@benzed/string'

/******************************************************************************/
// Exports
/******************************************************************************/

export default ({ ui, routing, name, auth, frontend, pretty, iff }) => {

  const Frontend = frontend::capitalize()

  return ui && pretty`
import React from 'react'
import styled from 'styled-components'

${routing && `import Navigation from './navigation'`}
${routing && `import Routes from './routes'`}
${auth && `import Login from './login'`}

/******************************************************************************/
// Styles
/******************************************************************************/

const ${Frontend}Layout = styled.div\`
  display: flex;
  flex-direction: column;
\`

/******************************************************************************/
// Main
/******************************************************************************/

const ${Frontend} = ({ children }) =>
  <${Frontend}Layout>
    ${routing ? '<Navigation />' : `${name} ${frontend}`}
    ${iff(routing)`<Routes />`}
    ${iff(auth)`<Login />`}
    {children}
  </${Frontend}Layout>

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${Frontend}
`
}

export function dependencies ({ ui }) {

  return ui && [
    'styled-components'
  ]
}
