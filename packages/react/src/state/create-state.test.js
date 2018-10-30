import { expect } from 'chai'
import createStore from './create-store'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('', () => {

  it('creates app state management with initials, reducers and actions', () => {

    const state = {
      count: 0
    }

    const reducers = {

      count: {
        increment: count => count + 1,
        decrement: count => count - 1
      }

    }

    const store = createStore(state, reducers)

    store.dispatch(['count', 'increment'])

  })

})
