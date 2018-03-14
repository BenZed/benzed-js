import './globals'

import React from 'react'
import { render } from 'react-dom'

import Example from './example'

import { Store } from '../state'

/******************************************************************************/
// Test Store
/******************************************************************************/

class Counter extends Store {

  number = 0

  constructor () {
    super()
    setInterval(() => this.setNumber(this.number + 1), 1000)
  }

  setNumber = value => this.set('number', value)

}

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', () => {

  const counter = new Counter()

  const rootComponent = <Example counter={counter} />
  const rootTag = document.getElementById('benzed-react')

  render(rootComponent, rootTag)

})
