import React from 'react'
import { Flex } from '../layout'

/******************************************************************************/
// Main Component
/******************************************************************************/

// TODO eventually a bunch of virtualization logic will go here
// class Virtual extends React.Component {
//
//   render () {
//     const { children, ...props } = this.props
//     return <Flex.Row {...props}>{children}</Flex.Row>
//   }
//
// }

const Virtual = props => <Flex.Row {...props} />

/******************************************************************************/
// Exports
/******************************************************************************/

export default Virtual
