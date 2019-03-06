import styled from 'styled-components'
import { $ } from '../util'
import { iconCss } from '../text/icon'

/******************************************************************************/
// Main Components
/******************************************************************************/

const IconButton = styled.button`

  ${iconCss}

  &:hover {
    opacity: 0.5;
  }

  &:active {
    opacity: 0.75;
  }

  &:disabled {
    background-color: ${$
    .ifProp('$fill')
    .branded
    .desaturate(1)
    .or
    .prop('theme', 'fg')
    .fade(0.5)
    .desaturate(1)};

    pointer-events: none;
  }

  transition: opacity 250ms, transform 250ms;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default IconButton
