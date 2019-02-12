import styled from 'styled-components'

import { $ } from '../util'

/******************************************************************************/
// Main Components
/******************************************************************************/

const InputBase = styled.input`
  display: flex;
  flex-direction: row;

  border-color: ${$.ifProp('error').prop('theme', 'brand', 'danger')};

  padding: 0.25em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default InputBase
