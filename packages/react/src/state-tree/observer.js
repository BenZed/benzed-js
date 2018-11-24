import React from 'react'
import { createPropTypesFor } from '@benzed/schema'
import { $$state } from './state-tree'
import { get } from '@benzed/immutable'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const isStateTree = value => is.defined(value) && $$state in value === false
  ? throw new Error('must be a State Tree')
  : null

/******************************************************************************/
// Main Component
/******************************************************************************/

class StateTreeObserver extends React.Component {

  state = (({ mapState, path, tree }) => {
    const value = mapState(tree.toJSON(), path, tree)
    return { value }
  })(this.props)

  static propTypes = createPropTypesFor(React => <proptypes>
    <array key='path'>
      <string required />
    </array>
    <func key='tree' required validate={isStateTree} />
    <func key='mapState' />
  </proptypes>)

  static defaultProps = {
    path: [],
    mapState: get.mut
  }

  // Handlers

  update = (state, path, tree) => {

    const { mapState } = this.props

    const mapped = mapState(state, path, tree)

    this.setState({ value: mapped })
  }

  // LifeCycle

  componentDidMount () {
    const { tree, path } = this.props

    tree.subscribe(this.update, path)
  }

  componentWillUnmount () {
    const { tree } = this.props

    tree.unsubscribe(this.update)
  }

  render () {

    const { children, path, tree } = this.props

    return this.state.value === undefined
      ? null
      : children(this.state.value, path, tree)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StateTreeObserver
