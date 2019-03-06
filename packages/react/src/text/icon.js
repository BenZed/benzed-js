import styled, { css } from 'styled-components'

import { $ } from '../util'

/******************************************************************************/
// Helper
/******************************************************************************/

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
    .set('50%')};

`

const iconCss = css`

  padding: 0em;
  width: 1.5em;
  height: 1.5em;

  font-size: ${$.prop('$size').or.set(1 / 1.5)}em;

  ${roundFillSizeCss}

  overflow: hidden;
  font-family: ${$
    .prop('theme', 'fonts', 'mono')
    .or
    .set('monospace')};

  display: flex;
  justify-content: center;
  align-items: center;

  transform: rotate(${$.prop('$turns').or.set(0).mut(v => v * 90)}deg);

`

/******************************************************************************/
// Main Components
/******************************************************************************/

const Icon = styled.span`
  ${iconCss}
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Icon

export {
  iconCss
}
