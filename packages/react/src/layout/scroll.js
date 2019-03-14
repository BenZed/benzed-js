import styled from 'styled-components'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Scroll = styled.div`
  flex: 1 1 auto;

  display: inherit;
  flex-direction: inherit;

  overflow-x: ${props => props.x || 'hidden'};
  overflow-y: ${props => props.y || 'hidden'};
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Scroll
