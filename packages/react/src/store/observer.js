import React from 'react'
import { createPropTypesFor } from '@benzed/schema'
import Store from './store'

import { get, copy } from '@benzed/immutable'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

const getValue = (store, path, state) => {

  path = wrap(path)

  const value = path.length === 0
    ? store
    : get.mut(state ?? copy.json(store), path)

  return value
}

/******************************************************************************/
// Main Component
/******************************************************************************/

class StoreObserver extends React.Component {

  state = {
    value: getValue(this.props.store, this.props.path)
  }

  static propTypes = createPropTypesFor(React => <proptypes>
    <array key='path'>
      <string required />
    </array>
    <Store key='store' required />
  </proptypes>)

  static defaultProps = {
    path: []
  }

  // Handlers

  update = state => {

    const { store, path } = this.props
    const value = getValue(store, path, state)

    this.setState({ value })
  }

  // LifeCycle

  componentDidMount () {
    const { store } = this.props

    store.subscribe(this.update)
  }

  componentWillUnmount () {
    const { store } = this.props

    store.unsubscribe(this.update)
  }

  render () {

    const { children } = this.props
    const { value } = this.state

    return children(value)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StoreObserver
