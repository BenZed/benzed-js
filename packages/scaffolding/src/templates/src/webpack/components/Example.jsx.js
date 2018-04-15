
export default ({ has, projectName }) => has.ui && !has.api && `

import styled from 'styled-components'
import React from 'react'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const Layout = styled.div\`
  font-family: Helvetica;
\`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Example = ({ children ...props }) =>
  <Layout {...props}>
    <h1>${projectName} components example</h1>
    { children }
  </Layout>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Example
`
