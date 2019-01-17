// TODO this needs to be updated to work with ClientStateTree

import React, { Children, createElement, cloneElement } from 'react'

import styled from 'styled-components'

import { Modal, Flex } from '../layout'
import { Slide, Write } from '../effect'

import { createPropTypesFor } from '@benzed/schema'
import { equals } from '@benzed/immutable'

import { isEvent } from '../util'
import is from 'is-explicit'

import { StateTreeConsumer } from '../state-tree'

/******************************************************************************/
// Validation
/******************************************************************************/

const mustHaveAuth = value =>
  value && is.func(value.login)
    ? value
    : throw new Error('must have authentication enabled.')

/******************************************************************************/
// Layout Components
/******************************************************************************/

const LoginPanel = styled(Flex.Column)`
  padding: 1em;
`

const Title = styled.strong`
  margin-bottom: 1em;
`

const ErrorMessage = styled(({ status, ...props }) =>
  <span {...props}><Write>{status?.message || ''}</Write></span>
)`
  color: ${props => `${props.theme?.error || '#ff5c33'}`};
  margin-left: auto;
  height: 1em;
`

const Form = styled.form`

  input {
    margin-bottom: 0.5em;
  }

  button {
    margin-left: auto;
  }

`

// TODO this needs to be refactored with @benzed inputs, panels, form elements and transition effects
const LoginModal = ({
  email, password, setEmail, setPassword, submit, visible, status, ...props
}) =>
  <Modal visible={visible}>

    <LoginPanel className={props.className}>

      <Slide from='top'>
        <Title>{props.title || 'Login'}</Title>
      </Slide>

      <Form onSubmit={submit}>

        <Slide from='left' to='right'>
          <input
            value={email}
            onChange={setEmail}
            placeholder='Email'
          />
        </Slide>

        <Slide from='right' to='left'>
          <input
            value={password}
            onChange={setPassword}
            placeholder='Password'
            type='password'
          />
        </Slide>

        <Slide from='bottom'>
          <button type='submit'>Submit</button>
        </Slide>

      </Form>

      <ErrorMessage status={status} />

    </LoginPanel>
  </Modal>

/******************************************************************************/
// Main Component
/******************************************************************************/

class LoginLogic extends React.Component {

  static propTypes = createPropTypesFor(React => <proptypes>
    <object key='client'
      required
      validate={mustHaveAuth}
    />
  </proptypes>)

  static defaultProps = {
    children: LoginModal
  }

  state = {
    email: '',
    password: '',
    status: 'disconnected',
    error: null
  }

  // EVENT HANDLING

  onClientStoreUpdate = client => {
    const { host, auth } = client
    const { status, userId } = auth

    this.setState({
      status,
      visible: !!host && !userId
    })
  }

  setEmail = e => {
    const email = isEvent(e)
      ? e.target.value
      : e
    this.setState({ email })
  }

  setPassword = e => {
    const password = isEvent(e)
      ? e.target.value
      : e

    this.setState({ password })
  }

  submit = e => {
    if (isEvent(e))
      e.preventDefault()

    const { client } = this.props
    const { email, password } = this.state

    return client.login(email, password)
  }

  // LIFE-CYCLE

  shouldComponentUpdate (nextProps, nextState) {
    return !equals(nextState, this.state)
  }

  componentDidMount () {
    const { client } = this.props
    const { onClientStoreUpdate } = this

    client.subscribe(onClientStoreUpdate, 'auth', 'host')

    onClientStoreUpdate(client)
  }

  componentWillUnmount () {
    const { client } = this.props
    const { onClientStoreUpdate } = this

    client.unsubscribe(onClientStoreUpdate)
  }

  render () {

    const { children, client, ...props } = this.props
    const { setEmail, setPassword, submit } = this

    const viewProps = {
      ...props,
      ...this.state,
      setEmail,
      setPassword,
      submit
    }

    return is.func(children)
      ? createElement(children, viewProps)
      : cloneElement(Children.only(children), viewProps)

  }

}

/******************************************************************************/
// Shortcuts
/******************************************************************************/

const Login = props =>
  <StateTreeConsumer>
    {tree => <LoginLogic client={tree.client} {...props} />}
  </StateTreeConsumer>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Login

export { LoginLogic, Login }
