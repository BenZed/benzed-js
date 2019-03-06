import React, { useState } from 'react'
import styled from 'styled-components'

import { $, useStateTree } from '../util'
import { Modal } from '../layout'
import { Slide, Write } from '../effect'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Login = styled(({ children, ...props }) => {

  const [ password, setPassword ] = useState('admin123')
  const [ email, setEmail ] = useState('ben@globalmechanic.com')

  const client = useStateTree('client')
  if (!client?.config.auth)
    throw new Error('Login component must have contextual access to a ClientStateTree with auth enabled')

  useStateTree.observe(client, 'host', 'auth')

  const visible = !!client.host && !client.auth.userId
  const error = client.auth.status?.message

  return <Modal visible={visible} opacity={error ? 0.75 : 0.5}>

    <div {...props}>

      <Slide from='top'>
        <h3>Login</h3>
      </Slide>

      <form onSubmit={e => {
        e.preventDefault()
        client.login(email, password)
      }} >

        <Slide from='right' to='left'>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='email'
          />
        </Slide>

        <Slide from='left' to='right'>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type='password'
            placeholder='password'
          />
        </Slide>

        <Slide from='bottom'>
          <button type='submit'>Submit</button>
        </Slide>

      </form>

      <span>
        <Write>{error || ''}</Write>
      </span>

    </div>

  </Modal>
})`

  display: flex;

  h3 {
    margin-bottom: 0.5em;
  }

  button, input, span {
    padding: 0.5em;
  }

  button {
    margin: 0.5em 0em 0em auto;

    &:hover {
      opacity: 0.75;
    }

    transition: opacity 250ms;
  }

  span {
    margin-left: auto;
    padding: 0.5em;

    height: 1em;

    color: ${$
    .prop('theme', 'brand', 'danger').lighten(0.25)
    .or
    .set('red')};
  }

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Login
