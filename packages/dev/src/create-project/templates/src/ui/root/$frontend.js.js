
import { capitalize } from '@benzed/string'

/******************************************************************************/
// Exports
/******************************************************************************/

export default ({ ui, routing, name, auth, frontend, pretty, iff }) => {

  const Frontend = frontend::capitalize()

  return ui && pretty`
import React from 'react'
import styled from 'styled-components'

import { GlobalStyle } from '@benzed/react'

${routing && `import Navigation from './navigation'`}
${routing && `import Routes from './routes'`}
${auth && `import Login from './login'`}

import theme from '../theme'

/******************************************************************************/
// Styles
/******************************************************************************/

const ${Frontend}Main = styled.div\`
  display: inherit;
  height: inherit;
\`

/******************************************************************************/
// Main
/******************************************************************************/

const ${Frontend} = ({ children }) =>
  <GlobalStyle theme={theme}>
    <${Frontend}Main>
      ${routing ? '<Navigation />' : `${name} ${frontend}`}
      ${iff(routing)`<Routes />`}
      ${iff(auth)`<Login />`}
      {children}
    </${Frontend}Main>
  </GlobalStyle>

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
