
export default ({ ui, routing, pretty }) => ui && routing && pretty`
import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { Home } from '../pages'

/******************************************************************************/
// Main
/******************************************************************************/

const Routes = () =>
  <Switch>
    <Route path='/' exact component={Home} />
  </Switch>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Routes
`

export function dependencies ({ ui, routing }) {
  return ui && routing && [
    'react',
    'react-router-dom'
  ]
}
