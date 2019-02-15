import React, { Children, createContext } from 'react'
import { createPropTypesFor } from '@benzed/schema'

// TODO

// Convert this using hooks, add useVisible hook

/******************************************************************************/
// Context
/******************************************************************************/

const VisibleContext = createContext('shown')

/******************************************************************************/
// Main Component
/******************************************************************************/

class Visible extends React.Component {

  // Props

  static propTypes = createPropTypesFor(React => <proptypes>
    <bool key='visible' />
    <number key='delay' range={['>', 0]} />
  </proptypes>)

  static defaultProps = {
    visible: true,
    delay: 250
  }

  // Internal

  timer = null

  // State

  state = {
    visible: true
  }

  constructor (props) {
    super(props)

    const { visible } = this.props
    this.state = {
      visible
    }
  }

  matchVisible = () => {
    const { visible } = this.props

    this.timer = null
    this.setState({ visible })
  }

  // LifeCycle

  componentDidUpdate (prevProps, prevState) {

    const { visible: shouldBeVisible, delay } = this.props
    const { visible: isVisible } = this.state

    if (shouldBeVisible !== isVisible && this.timer === null)
      this.timer = setTimeout(this.matchVisible, delay)
  }

  componentWillUnmount () {
    if (this.timer !== null)
      clearTimeout(this.timer)
  }

  render () {
    const { visible: shouldBeVisible, children } = this.props
    const { visible: isVisible } = this.state

    const count = Children.count(children)
    if (count === 0)
      return null

    const visibility = shouldBeVisible
      ? isVisible
        ? 'shown'
        : 'showing'
      : isVisible
        ? 'hiding'
        : 'hidden'

    return <VisibleContext.Provider value={visibility}>
      { children }
    </VisibleContext.Provider>

  }
}

/******************************************************************************/
// Extend
/******************************************************************************/

function observe (VisibleEffect, renderHidden) {

  if (this !== undefined && this !== Visible) {
    renderHidden = VisibleEffect
    VisibleEffect = this
  }

  const ObservedVisibleEffect = props =>
    <VisibleContext.Consumer>
      { visibility => renderHidden || visibility !== 'hidden'
        ? <VisibleEffect visibility={visibility} {...props}/>
        : null
      }
    </VisibleContext.Consumer>

  ObservedVisibleEffect.Wrapped = VisibleEffect

  return ObservedVisibleEffect
}

Visible.observe = observe
Visible.Context = VisibleContext

/******************************************************************************/
// Exports
/******************************************************************************/

export default Visible

export {
  Visible,
  VisibleContext,

  observe
}
