import React from 'react'
import { Route, Switch } from 'react-router'
import { Home, Package, Missing } from '../pages'

import { PropTypeSchema, arrayOf, object, any } from '@benzed/schema'

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
