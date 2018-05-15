import React, { Children, cloneElement } from 'react'

import { instanceOf, string, arrayOf, oneOfType, objectOf } from 'prop-types'

import Store from './store'
import { Context } from './Provider'

/******************************************************************************/
// Main Component
/******************************************************************************/

class Observer extends React.Component {

  static propTypes = {

    stores: objectOf(
      instanceOf(Store)
    ).isRequired,

    config: objectOf(
      oneOfType([
        string,
        arrayOf(string)
      ])
    ).isRequired

  }

  state = {
    stores: null,
    timestamp: null
  }

  update = state => {
    this.setState({ timestamp: new Date() })
  }

  componentWillMount () {

    const { stores: contextStores, config } = this.props

    const stateStores = {}

    for (const key in config) {
      const store = contextStores[key]
      if (!store)
        throw new Error(`no store available named ${key}!`)

      stateStores[key] = store
      store.subscribe(this.update, config[key])
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

    const props = {
      ...stores
    }

    return Children.map(
      children,
      child => cloneElement(child, props)
    )
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default props =>
  <Context>
    { stores => <Observer stores={stores} {...props} /> }
  </Context>
