import React, { Children, cloneElement, createElement } from 'react'
import styled from 'styled-components'

import { PropTypeSchema, typeOf, required } from '@benzed/schema'

import { StoreConsumer } from '../store/context'
import ClientStore from './store/client-store'
import { get } from '@benzed/immutable'

/******************************************************************************/
// Validation
/******************************************************************************/

const mustHaveAuth = value =>
  value && value.auth
    ? value
    : new Error('must have authentication enabled.')

/******************************************************************************/
// Layout Components
/******************************************************************************/

const LoginView = () =>
  <div>LOGIN</div>

/******************************************************************************/
// Main Component
/******************************************************************************/

class Login extends React.Component {

  static propTypes = new PropTypeSchema({
    client: typeOf(ClientStore, required, mustHaveAuth)
  })

  state = {
    email: '',
    password: '',
    error: ''
  }

  // events

  onAuthenticate = (state, path) => {

    const error = get.mut(state, path)

    this.setState({ error })
  }

  setEmail = () => {}

  setPassword = () => {}

  submit = () => {}

  // life-cycle

  componentDidMount () {
    const { client } = this.props
    const { onAuthenticate } = this

    client.subscribe(onAuthenticate, ['auth', 'error'])
  }

  componentWillUnmount () {
    const { client } = this.props
    const { onAuthenticate } = this

    client.unsubscribe(onAuthenticate)
  }

  render () {

    const { client, children } = this.props

    const { setEmail, setPassword, submit } = this

    const viewProps = {
      ...this.state,
      error: client.auth.error,
      setEmail,
      setPassword,
      submit
    }

    return children
      ? cloneElement(Children.only(children), viewProps)
      : createElement(LoginView, viewProps)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Login
