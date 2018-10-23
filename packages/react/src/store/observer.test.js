import React from 'react'
import { expect } from 'chai'

import Store from './store'
import Observer from './observer'

import renderer from 'react-test-renderer'

import { push } from '@benzed/immutable'

/* eslint-disable react/prop-types */

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

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Observer component', () => {

  const messages = new MessageStore()

  describe('basic usage', () => {

    it('is used to send state changes to child components', () => {

      const messageList = renderer.create(
        <Observer
          store={messages}>
          { store => <ul>
            { store.messages.map((msg, i) =>
              <li key={i}>{msg.body}</li>
            )}
          </ul>}
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
