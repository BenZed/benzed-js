import React from 'react'
import { expect } from 'chai'

import Store from './store'
import { Observer } from './observer'

import renderer from 'react-test-renderer'

import { push } from '@benzed/immutable'

/******************************************************************************/
// Example Store
/******************************************************************************/

class MessageStore extends Store {

  messages = []

  addMessage (body) {

    const msg = {
      body,
      time: new Date()
    }

    const msgs = this.messages::push(msg)

    this.set('messages', msgs)
  }

}

/******************************************************************************/
// Message Consumer
/******************************************************************************/

const Messages = ({ messages }) =>
  <ul>
    { messages.messages.map((msg, i) =>
      <li key={i}>{msg.body}</li>
    )}
  </ul>

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Observer component', () => {

  const messages = new MessageStore()

  describe('basic usage', () => {

    it('is used to send state changes to child components', () => {

      const messageList = renderer.create(
        <Observer
          stores={{ messages }}
          listen='messages'>
          <Messages/>
        </Observer>
      )

      expect(messageList.toJSON().children).to.be.equal(null)

      messages.addMessage('Hello World.')

      expect(messageList.toJSON().children).to.be.deep.equal([
        {
          children: [ 'Hello World.' ],
          props: {},
          type: 'li'
        }
      ])
    })
  })
})
