import React from 'react'
import { createPropTypesFor } from '@benzed/schema'
import { max, random, round } from '@benzed/math'

/******************************************************************************/
// Helper
/******************************************************************************/

const randomly = () => random(-1, 1)::round()

function getOrderedChars (current, target, method) {

  const length = max(current.length, target.length)

  const order = Array.from({ length }, (v, i) => i)

  const sorter = method === 'auto'
    ? target.length < current.length
      ? 'right'
      : target.length > current.length
        ? 'left'
        : 'random'
    : method

  if (sorter === 'random')
    order.sort(randomly)

  else if (sorter === 'right')
    order.reverse()

  // else if sorter === 'left'

  return order

}

/******************************************************************************/
// Main Component
/******************************************************************************/

class Write extends React.Component {

  static propTypes = createPropTypesFor(React => <proptypes>
    <number key='time'/>
    <string key='children'/>
    <string key='start'/>
    <value key='method'>left right random auto</value>
  </proptypes>)

  static defaultProps = {
    time: 20,
    method: 'auto'
  }

  state = {
    letters: null
  }

  timer = null

  changeLetter = () => {

    this.timer = null

    const { children: target = '', method } = this.props
    const { letters: current = '' } = this.state

    if (current === target)
      return

    this.orderedIndexes = this.orderedIndexes || getOrderedChars(current, target, method)

    const chars = []

    let altered = false

    for (const index of this.orderedIndexes) {
      let c = current.charAt(index)
      const t = target.charAt(index)

      if (!c && index < target.length)
        c = ' '

      chars[index] = !altered ? t : c

      if (t !== c)
        altered = true

    }

    this.setState({ letters: chars.join('') })

  }

  componentDidUpdate (prev) {

    const { time, children, method } = this.props
    const { letters } = this.state

    if (prev.children !== children || prev.method !== method)
      delete this.orderedIndexes

    const matches = children === letters

    if (this.timer === null && !matches)
      this.timer = setTimeout(this.changeLetter, time)

  }

  componentDidMount () {

    const { start, children } = this.props

    const letters = typeof start === 'string' ? start : children

    this.setState({ letters })

  }

  componentWillUnmount () {

    if (this.timer !== null)
      clearTimeout(this.timer)

  }

  render () {

    const { letters } = this.state
    const { children, start } = this.props

    return letters === null
      ? typeof start === 'string'
        ? start
        : children
      : letters

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Write
