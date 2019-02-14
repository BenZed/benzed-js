import styled from 'styled-components'
import { $ } from '../util'

/******************************************************************************/
// Main Components
/******************************************************************************/

/* eslint-disable indent */

const Label = styled.label`

  background-color: ${$
    .ifProp('filled')
      .branded
      .or
      .prop('theme', 'fg')
    .else
    .set('transparent')};

  color: ${$.ifBranded
    .ifProp('filled')
      .set('white')
      .else
      .branded
    .else
    .prop('theme', 'fg')
  };

  font-family: ${$
    .prop('theme', 'fonts', 'mono')
    .or
    .set('monospace')};

  font-weight: ${$
    .ifProp('filled')
      .set('normal')
    .else
    .set('bold')};

  border-radius: 0.25em;
  padding: 0.25em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Label
