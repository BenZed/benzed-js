import styled, { css } from 'styled-components'

import { $ } from '../util'
import { roundFillSizeCss } from '../input/button'

/******************************************************************************/
// Helper
/******************************************************************************/

const iconCss = css`

  padding: 0em;
  width: 1.5em;
  height: 1.5em;

  font-size: ${$.prop('$size').or.set(1 / 1.5)}em;

  overflow: hidden;
  font-family: ${$
    .prop('theme', 'fonts', 'mono')
    .or
    .set('monospace')};

  display: flex;
  justify-content: center;
  align-items: center;

  transform: rotate(${$.prop('$turns').or.set(0).mut(v => v * 90)}deg);

  border-radius: ${$
    .ifProp('$round')
    .set('0.25em')
    .else
    .set('initial')};

`

/******************************************************************************/
// Main Components
/******************************************************************************/

const Icon = styled.span`

  ${roundFillSizeCss}
  ${iconCss}

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Icon

export {
  iconCss
}
