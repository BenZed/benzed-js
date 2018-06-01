import React, { Children, cloneElement, createElement } from 'react'
import styled from 'styled-components'

import { PropTypeSchema, typeOf, required } from '@benzed/schema'

import { StoreConsumer } from '../store/context'
import ClientStore from './store/client-store'
import { get, equals } from '@benzed/immutable'
import { isEvent } from '../util'

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

    visible: false,
    error: null
  }

  // EVENT HANDLING

  onClientStoreUpdate = state => {
    const { userId, error } = state.auth
    const { host } = state

    const visible = !!host && !userId

    this.setState({ visible, error })
  }

  // setEmail = e => {
  //   const email = isEvent(e)
  //     ? e.target.value
  //     : e
  //   this.setState({ email })
  // }
  //
  // setPassword = e => {
  //   const password = isEvent(e)
  //     ? e.target.value
  //     : e
  //
  //   this.setState({ password })
  // }
  //
  // submit = e => {
  //   if (isEvent(e))
  //     e.preventDefault()
  //
  //   const { client } = this.props
  //   const { email, password } = this.state
  //
  //   return client.login(email, password)
  // }

  // LIFE-CYCLE

  shouldComponentUpdate (nextProps, nextState) {
    return !equals(nextState, this.state)
  }

  componentDidMount () {
    const { client } = this.props
    const { onClientStoreUpdate } = this

    client.subscribe(onClientStoreUpdate, 'auth')
    client.subscribe(onClientStoreUpdate, 'host')
  }

  componentWillUnmount () {
    const { client } = this.props
    const { onClientStoreUpdate } = this

    client.unsubscribe(onClientStoreUpdate)
  }

  render () {

    const { children } = this.props

    const { setEmail, setPassword, submit } = this

    const viewProps = {
      ...this.state,
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
