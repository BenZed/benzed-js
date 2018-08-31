import React from 'react'
import { PropTypeSchema, typeOf, arrayOf, required } from '@benzed/schema'
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

  static propTypes = {
    path: arrayOf(typeOf(String)),
    store: typeOf(Store, required),
    children: typeOf(Function, required)
  }

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

// Gotta do it like this so the linter will stfu

StoreObserver.propTypes = StoreObserver.propTypes::PropTypeSchema()

/******************************************************************************/
// Exports
/******************************************************************************/

export default StoreObserver
