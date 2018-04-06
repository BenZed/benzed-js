import './globals'

import React from 'react'
import { render } from 'react-dom'

import Example from './example'

import { Store, Provider } from '../state'

/******************************************************************************/
// Test Store
/******************************************************************************/

class Counter extends Store {

  meta = {
    number: 0,
    time: null
  }

  constructor () {
    super()
    setInterval(this.update, 100 + Math.random() * 300)
  }

  update = () => this.set('meta', {
    number: this.meta.number + 1,
    time: new Date()
  })

}

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', () => {

  const counter = new Counter()

  const stores = { counter }

  const rootTag = document.getElementById('benzed-react')

  const rootComponent =
    <Provider {...stores}>
      <Example />
    </Provider>

  render(rootComponent, rootTag)

})
