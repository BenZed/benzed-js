import './globals'

import React from 'react'
import { render } from 'react-dom'

import Example from './example'

import { set } from '@benzed/immutable'

import { Store, Provider } from '../state'

/******************************************************************************/
// Test Store
/******************************************************************************/

const AVERAGE = Symbol('average')

class Stats extends Store {

  scores = [];

  [AVERAGE] = 0
  get average () {
    return this[AVERAGE]
  }

  addScore (value) {

    const scores = set(this.scores, this.scores.length, value)

    this[AVERAGE] = scores.reduce((a, v) => a + v) / scores.length

    this.set('scores', scores)
  }

}

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', () => {

  const stats = new Stats()
  stats.addScore(5)

  const stores = { stats }
  const rootTag = document.getElementById('benzed-react')

  const rootComponent =
    <Provider {...stores}>
      <Example />
    </Provider>

  render(rootComponent, rootTag)

})
