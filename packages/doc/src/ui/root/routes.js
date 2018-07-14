import React from 'react'
import { Route, Switch } from 'react-router'
import { Home, Package, Missing } from '../pages'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Routes = ({ children, packages, ...props }) => {

  return <Switch>

    <Route path='/' exact component={Home}/>

    {packages
      .map(pkg => <Route
        key={pkg.name}
        path={`/${pkg.name}/:docName?`}
        render={route =>
          <Package pkg={pkg} {...route }/>
        }
      />
      )}

    <Route component={Missing}/>

  </Switch>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Routes
