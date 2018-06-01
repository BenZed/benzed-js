import React, { Children, cloneElement } from 'react'

import {
  PropTypeSchema,
  object, cast
} from '@benzed/schema'

import Store from './store'
import { StoreConsumer } from './context'
import is from 'is-explicit'
/******************************************************************************/
//
/******************************************************************************/

function toObject (value) {

  if (is(value, String))
    value = [ value ]

  if (is(value, Array))
    value = value.reduce((obj, str) => {
      obj[str] = []
      return obj
    }, { })

  return value
}

function listenKeys (listeners) {

  for (const key in listeners) {
    const listen = listeners[key]
    if (!is(listen, Array) || (listen.length > 0 && !is.arrayOf(listen, String)))
      return new Error('Must be an array of Strings.')
  }

  return listeners
}

function storeKeys (stores) {

  for (const key in stores) {
    const store = stores[key]
    if (!is(store, Store))
      return new Error('Must be a Store instance.')
  }

  return stores
}

/******************************************************************************/
// Main Component
/******************************************************************************/

class Observer extends React.Component {

  static propTypes = new PropTypeSchema({

    stores: object(storeKeys),

    listen: object(
      cast(toObject),
      listenKeys
    )

  })

  state = {
    stores: null,
    timestamp: null
  }

  update = state =>
    this.setState({ timestamp: new Date() })

  componentWillMount () {

    const { stores: contextStores } = this.props
    const listen = toObject(this.props.listen)

    const stateStores = {}

    for (const key in listen) {
      const store = contextStores[key]
      if (!store)
        throw new Error(`no store available named ${key}!`)

      stateStores[key] = store
      store.subscribe(this.update, listen[key])
    }

    this.setState({ stores: stateStores })
  }

  componentWillUnmount () {
    const { stores } = this.state

    for (const key in stores) {
      const store = stores[key]

      store.unsubscribe(this.update)
    }
  }

  render () {

    const { children } = this.props
    const { stores } = this.state

    return Children.map(
      children,
      child => cloneElement(child, stores)
    )
  }

}

/******************************************************************************/
// Context
/******************************************************************************/

const StoreObserver = props =>
  <StoreConsumer>
    { stores => <Observer {...props} stores={stores} /> }
  </StoreConsumer>

/******************************************************************************/
// Exports
/******************************************************************************/

export default StoreObserver

export { Observer, StoreObserver }
