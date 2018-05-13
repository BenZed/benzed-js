
export default ({ ui, name, routing, pretty }) => ui && routing && pretty`
import React from 'react'
import styled from 'styled-components'

/******************************************************************************/
// Styles
/******************************************************************************/

const HomePageLayout = styled.div\`\`

/******************************************************************************/
// Main
/******************************************************************************/

const HomePage = () =>
  <HomePageLayout>
    ${name} home page
  </HomePageLayout>

/******************************************************************************/
// Exports
/******************************************************************************/

export default HomePage
`

export function dependencies ({ routing, ui }) {
  return routing && ui && [
    'styled-components'
  ]
}
