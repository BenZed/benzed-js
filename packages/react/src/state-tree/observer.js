import React from 'react'
import { createPropTypesFor } from '@benzed/schema'
import { $$state } from './state-tree'
import { get } from '@benzed/immutable'
import { first } from '@benzed/array'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const isStateTree = value => is.defined(value) && $$state in value === false
  ? throw new Error('must be a State Tree')
  : null

const getDefaultMappedState = tree => tree

/******************************************************************************/
// Main Component
/******************************************************************************/

class StateTreeObserver extends React.Component {

  state = (({ mapState, path, root: _root, tree }) => {
    const sourceTree = get.mut(tree, _root)
    const value = mapState(sourceTree, path)
    return { value }
  })(this.props)

  static propTypes = createPropTypesFor(React => <proptypes>
    <array key='path' />
    <func key='tree' required validate={isStateTree} />
    <func key='mapState' />
  </proptypes>)

  static defaultProps = {
    root: [],
    path: [],
    mapState: getDefaultMappedState
  }

  // Handlers

  update = (state, path) => {

    const { mapState, root: _root, tree } = this.props

    const sourceTree = get.mut(tree, _root)

    const mapped = mapState(sourceTree, path)

    this.setState({ value: mapped })
  }

  // LifeCycle

  componentDidMount () {
    const { tree, root: _root, path } = this.props

    const sourceTree = get.mut(tree, _root)

    const paths = path.length > 0 && is.array(first(path))
      ? path
      : [ path ]

    sourceTree.subscribe(this.update, ...paths)
  }

  componentWillUnmount () {
    const { tree, root: _root } = this.props

    const sourceTree = get.mut(tree, _root)

    sourceTree.unsubscribe(this.update)
  }

  render () {

    const { children, path } = this.props

    return this.state.value === undefined
      ? null
      : children(this.state.value, path)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StateTreeObserver
