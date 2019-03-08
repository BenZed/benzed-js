import styled, { css } from 'styled-components'

import { $ } from '../util'

/******************************************************************************/
// Helper
/******************************************************************************/

const buttonCss = css`

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

const roundFillSizeCss = css`

  background-color: ${$
    .ifProp('$fill')
    .branded
    .or
    .prop('theme', 'fg').fade(0.5)};

  color: ${$
    .ifProp('$fill')
    .prop('theme', 'brandedText')
    .or
    .set('white')
    .else.branded};

  border-radius: ${$
    .ifProp('$round')
    .set('0.5em')
    .else
    .set('initial')};

`

/******************************************************************************/
// Main Components
/******************************************************************************/

const Button = styled.button`

  ${roundFillSizeCss}
  ${buttonCss}

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Button

export { buttonCss, roundFillSizeCss }
