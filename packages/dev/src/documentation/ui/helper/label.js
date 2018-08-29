import styled from 'styled-components'
import $ from '../../theme'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Label = styled.label`
  font-family: monospace;
  font-size: 0.8em;

  background-color: ${$.branded.or.theme.codefg};
  color: ${$.branded.darken(0.5).or.theme.codefg.darken(0.5)};

  padding: 0.25em 0.5em 0.25em 0.5em;
  border-radius: 0.5em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Label
