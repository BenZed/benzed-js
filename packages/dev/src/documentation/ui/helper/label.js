import styled from 'styled-components'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Label = styled.label`
  font-family: monospace;
  font-size: 0.8em;

  background-color: ${props => props.theme.primary.toString()};
  padding: 0.25em 0.5em 0.25em 0.5em;
  border-radius: 0.5em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Label
