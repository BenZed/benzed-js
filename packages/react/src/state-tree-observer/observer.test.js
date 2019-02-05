import React from 'react'
import { expect } from 'chai'

import Observer from './observer'

import renderer from 'react-test-renderer'

import { milliseconds } from '@benzed/async'

import StateTree, { state, action } from '@benzed/state-tree'
/* eslint-disable react/prop-types */

/******************************************************************************/
// Message Consumer
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Observer component', () => {

  class Messages extends StateTree {

    @state
    all = []

    @action('all')
    addMessage = value => [ ...this.all, value ]

  }

  let messages
  before(() => {
    messages = new Messages()
  })

  describe('basic usage', () => {

    it('is used to send state changes to child components', async () => {

      const MessageList = () => <Observer
        tree={messages}
      >
        { messages => <ul>
          { messages.all.map((msg, i) =>
            <li key={i}>{msg}</li>
          ) }
        </ul>}
      </Observer>

      const messageList = renderer.create(<MessageList/>)
      expect(messageList.toJSON().children).to.be.equal(null)

      messages.addMessage('Hello World.')
      await milliseconds(10)
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
