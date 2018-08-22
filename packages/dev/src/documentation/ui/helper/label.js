import styled from 'styled-components'
import $ from '../../theme'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Label = styled.label`
  font-family: monospace;
  font-size: 0.8em;

  background-color: ${$.theme.brand.primary};
  padding: 0.25em 0.5em 0.25em 0.5em;
  border-radius: 0.5em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Label
