
export default ({ ui, name, routing, pretty }) => ui && routing && pretty`
import React from 'react'
import Page from './page'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Missing = ({ children, location, ...props }) =>
  <Page>
    { location.pathname } is not a valid page
  </Page>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Missing
`
