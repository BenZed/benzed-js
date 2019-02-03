import React from 'react'

import StateTree from '@benzed/state-tree'

import { createPropTypesFor } from '@benzed/schema'
import { get } from '@benzed/immutable'
import { first } from '@benzed/array'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

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
    <array key='root' cast >
      <string required />
    </array>
    <array key='path' cast >
      <string required />
    </array>
    <StateTree key='tree' required />
    <func key='mapState' />
  </proptypes>)

  static defaultProps = {
    root: [],
    path: [],
    mapState: getDefaultMappedState
  }

  mounted = false

  // Handlers

  update = (_tree = this.props.tree, path = this.props.path) => {

    const { mapState, root: _root, tree: sourceTree } = this.props
    const rootTree = get.mut(sourceTree, _root)
    const mapped = mapState(rootTree, path)

    setTimeout(() => this.mounted && this.setState({ value: mapped }), 0)
  }

  // LifeCycle

  componentDidMount () {
    this.mounted = true
    this.subscribeToTree()
  }

  subscribeToTree () {
    const { tree, root: _root, path } = this.props

    const sourceTree = get.mut(tree, _root)

    const paths = path.length > 0 && is.array(first(path))
      ? path
      : [ path ]

    sourceTree.subscribe(this.update, ...paths)
  }

  componentWillUnmount () {
    this.mounted = false
    const { tree, root: _root } = this.props

    const sourceTree = get.mut(tree, _root)

    sourceTree.unsubscribe(this.update)
  }

  componentDidUpdate (prev) {

    const { tree: oldTree } = prev
    const { tree: newTree } = this.props

    if (oldTree !== newTree) {
      oldTree.unsubscribe(this.update)

      this.subscribeToTree()
      setTimeout(this.update, 0)
    }
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
