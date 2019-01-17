import React from 'react'
import styled from 'styled-components'
import { Flex } from '../layout'
import { createPropTypesFor } from '@benzed/schema'

/******************************************************************************/
//
/******************************************************************************/

/******************************************************************************/
// Main Component
/******************************************************************************/

// TODO eventually a bunch of virtualization logic will go here
class Virtual extends React.Component {

  static propTypes = createPropTypesFor(React =>
    <proptypes>
      <any key='cellWidth' />
      <any key='cellHeight' />
    </proptypes>
  )

  componentDidMount () {
    this.calculate()
  }

  onScroll = e => {
    console.log('scrolling')
  }

  ref = dom => {
    console.log(dom)
    this.dom = dom
  }

  calculate = () => {

  }

  render () {

    const { children, total, skip, ...props } = this.props

    const { onScroll, ref } = this

    const events = { onScroll }

    return <div {...props} {...events} ref={ref}>
      {children}
    </div>

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Virtual
