import styled from 'styled-components'
import { iconCss } from '../text/icon'
import { buttonCss, roundFillSizeCss } from './button'

/******************************************************************************/
// Main Components
/******************************************************************************/

const IconButton = styled.button`

  ${roundFillSizeCss}
  ${buttonCss}
  ${iconCss}

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default IconButton
