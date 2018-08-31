import styled from 'styled-components'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Flex = styled.div`
  display: flex;
`

Flex.Column = styled(Flex)`
  flex-direction: column;
`

Flex.Row = styled(Flex)`
  flex-direction: row;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Flex
