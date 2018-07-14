import styled from 'styled-components'
import React from 'react'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Scroll = styled(({ x, y, ...props }) => <div {...props} />)`
  flex: 1 1 auto;

  display: inherit;
  flex-direction: inherit;

  overflow-x: ${props => props.x ? 'auto' : 'hidden'};
  overflow-y: ${props => props.y ? 'auto' : 'hidden'};
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Scroll
