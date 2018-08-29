import { capitalize, toCamelCase } from '@benzed/string'

/******************************************************************************/
// Exports
/******************************************************************************/

export default ({ ui, name, auth, pretty }) => {

  const Name = name::toCamelCase()::capitalize()

  return ui && auth && pretty`import React from 'react'
import { Login } from '@benzed/react'

/******************************************************************************/
// Logic
/******************************************************************************/

const ${Name}LoginView = props => {

  const { email, setEmail, password, setPassword, submit, visible, status } = props

  // TODO implement your own login view and place it in the login view as a child,
  // or remove this to use the default login view
  return null
}
/******************************************************************************/
// View
/******************************************************************************/

const ${Name}Login = props =>
  <Login {...props} >
    <${Name}LoginView/>
  </Login>

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${Name}Login`
}
