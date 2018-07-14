import styled from 'styled-components'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Flex = styled.div`
  display: flex;
`

Flex.Column = Flex.extend`
  flex-direction: column;
`

Flex.Row = Flex.extend`
  flex-direction: row;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Flex
