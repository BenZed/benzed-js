import React from 'react'
import styled from 'styled-components'

import { Flex } from '../../layout'

import { IconButton } from '../../input'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Main = styled(props => {

  return <Flex.Column {...props}>

    <h1>Bulding Composable Stylings that can be cast onto logic components</h1>

    <Flex.Row items='center'>

      Some buttons:
      <IconButton $fill $round $brand='primary' disabled>✗</IconButton>
      <IconButton $round>✗</IconButton>
      <IconButton $fill $brand='primary'>✓</IconButton>
      <IconButton $fill $brand='danger'>✗</IconButton>

    </Flex.Row>

  </Flex.Column>

})`
  padding: 1em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Main
