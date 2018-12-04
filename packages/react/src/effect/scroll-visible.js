import React from 'react'
import Visible from './visible'
import { on, off } from '../util'

/******************************************************************************/
// Main Component
/******************************************************************************/

class ScrollVisible extends React.Component {

  // State Setters

  state = {
    inScrollView: true
  }

  // Handlers

  getRef = section => {
    this.section = section
  }

  onScroll = e => {
    if (!this.section)
      return

    const bounds = this.section.getBoundingClientRect()

    const windowWidth = window.innerWidth || document.documentElement.clientWidth
    const windowHeight = window.innerHeight || document.documentElement.clientHeight

    const top = bounds.y < windowHeight
    const bottom = bounds.bottom > 0
    const left = bounds.x < windowWidth
    const right = bounds.right > 0

    const inScrollView = top && bottom && left && right
    if (inScrollView !== this.state.inScrollView)
      this.setState({ inScrollView })
  }

  // Life Cycle

  componentDidMount () {
    window::on('scroll', this.onScroll)
    this.onScroll()
  }

  componentWillUnmount () {
    window::off('scroll', this.onScroll)
  }

  render () {

    const { inScrollView } = this.state
    const { children, ...props } = this.props

    return <section
      ref={this.getRef}
      {...props}
    >
      <Visible visible={inScrollView}>
        { children }
      </Visible>
    </section>
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ScrollVisible
