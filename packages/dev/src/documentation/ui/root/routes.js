import React from 'react'
import { Route, Switch } from 'react-router'
import { Home, Missing } from '../pages'
import is from 'is-explicit'

import { PropTypeSchema, arrayOf, object, any } from '@benzed/schema'

/******************************************************************************/
// Helper
/******************************************************************************/

function createRoutesFromDocs (docs) {

  const routes = []
  for (const key in docs) {

    const pages = docs[key]

    const components = pages.reduce((components, page) =>
      components
        .concat(Object
          .values(page)
          .filter(is.func)
        )
      , [])

    routes.push(
      <Route
        key={key}
        path={`/${key}/:componentName?`}
        render={components::Page}
      />
    )
  }

  return routes
}

function Page ({ match }) {

  const components = this

  const { componentName } = match.params

  return components
    .filter(Component => !componentName ||
      componentName === Component.name.toLowerCase()
    )
    .map(Component => <Component key={Component.name} />)
}

/******************************************************************************/
// Main Component
/******************************************************************************/

const Routes = ({ children, docs, ...props }) => {

  const routes = createRoutesFromDocs(docs)

  return <Switch>
    <Route path='/' exact component={Home}/>
    {routes}
    <Route component={Missing}/>
  </Switch>
}

/******************************************************************************/
// Prop Types
/******************************************************************************/

Routes.propTypes = new PropTypeSchema({
  children: any,
  packages: arrayOf(object)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default Routes
