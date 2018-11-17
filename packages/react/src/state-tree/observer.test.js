import React from 'react'
import { expect } from 'chai'

import StateTree, { $$state } from './state-tree'
import Observer from './observer'

import renderer from 'react-test-renderer'

import { push, get } from '@benzed/immutable'
import { milliseconds } from '@benzed/async'
/* eslint-disable react/prop-types */

/******************************************************************************/
// Message Consumer
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('Observer component', () => {
  let messages
  before(() => {
    messages = new StateTree({
      all: []
    }, {
      addMessage (value) {
        const [ all, setAll ] = this('all')
        setAll(all::push(value))
      }
    })
  })

  describe('basic usage', () => {

    it('is used to send state changes to child components', () => {

      const MessageList = () => <Observer
        tree={messages}
        path={['all']}
      >
        { all => <ul>
          { all.map((msg, i) =>
            <li key={i}>{msg}</li>
          ) }
        </ul>}
      </Observer>

      const messageList = renderer.create(<MessageList/>)
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
