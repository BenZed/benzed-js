import React, { Children, cloneElement } from 'react'
import styled from 'styled-components'

import { Modal } from '../layout'
import { Visible, Fade, Slide } from '../effect'

import { PropTypeSchema, typeOf, required } from '@benzed/schema'
import { equals } from '@benzed/immutable'

import { StoreConsumer } from '../store/context'
import ClientStore from './store/client-store'

import { isEvent } from '../util'
import is from 'is-explicit'

/******************************************************************************/
// Validation
/******************************************************************************/

const mustHaveAuth = value =>
  value && value.config && value.config.auth
    ? value
    : new Error('must have authentication enabled.')

/******************************************************************************/
// Layout Components
/******************************************************************************/

// TEMP
const TempLoginPanel = styled.div`

  padding: 0.5em;
  font-size: 1.5em;

  color: white;

  span {
    color: rgb(255, 125, 125);
  }

  form {
    display: flex;
    flex-direction: column;
  }

  input, button {
    color: inherit;
    outline: none;
    border: none;
    background-color: transparent;
    ::placeholder {
      color: rgba(255,255,255,0.75);
    }
    padding: 0.25em;
    margin: 0.25em;
  }

  button {
    width: 2em;
    margin-left: auto;
    cursor: pointer;
    &:hover {
      opacity: 0.5;
    }
  }

  input {
    border-bottom: 1px solid white;
  }
`

// TODO this needs to be refactored with @benzed inputs, panels, form elements and transition effects
const LoginModal = ({
  email, password, setEmail, setPassword, submit, visible, status, ...props
}) =>
  <Visible visible={visible}>
    <Fade>
      <Modal>
        <TempLoginPanel>

          <Slide from='top'>
            <div>
              <strong>Login</strong>
              <span>{is(status, Error) ? ' ' + status.message : ''}</span>
            </div>
          </Slide>

          <form onSubmit={submit}>

            <Slide from='left' to='right'>
              <input value={email} onChange={setEmail} placeholder='Email'/>
            </Slide>

            <Slide from='right' to='left'>
              <input value={password} onChange={setPassword} placeholder='Password' type='password'/>
            </Slide>

            <Slide from='bottom'>
              <button type='submit'>Submit</button>
            </Slide>

          </form>

        </TempLoginPanel>
      </Modal>
    </Fade>
  </Visible>

/******************************************************************************/
// Main Component
/******************************************************************************/

class LoginLogic extends React.Component {

  static propTypes = new PropTypeSchema({
    client: typeOf(ClientStore, required, mustHaveAuth)
  })

  static defaultProps = {
    children: <LoginModal/>
  }

  state = {
    email: '',
    password: '',

    status: 'disconnected',
    error: null
  }

  // EVENT HANDLING

  onClientStoreUpdate = state => {
    const { host, userId } = state
    const { status } = state.login

    this.setState({
      status: status,
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

    client.subscribe(onClientStoreUpdate, 'userId', 'host', 'login')
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

    return cloneElement(Children.only(children), viewProps)
  }

}

/******************************************************************************/
// Shortcuts
/******************************************************************************/

const Login = props =>
  <StoreConsumer>
    {stores => <LoginLogic client={stores.client} {...props} />}
  </StoreConsumer>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Login

export { LoginLogic, Login }
