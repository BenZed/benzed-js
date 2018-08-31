import styled from 'styled-components'

import Label from './label'

import $ from '../../theme'

/******************************************************************************/
// Main
/******************************************************************************/

const SubTitle = styled.h2`
  color: ${$.theme
    .brand
    .primary
    .darken(0.5)};

  display: flex;
  flex-direction: row;
  align-items: center;

  margin: 0.25em 0em 0.25em 0em;

  ${Label} {
    font-size: 0.6em;
    margin-left: auto;
  }
`

const Title = styled(SubTitle.withComponent('h1'))`

  padding: 0.25em 0.25em 0.25em 0em;

  border-bottom: 1px solid ${$
    .theme
    .brand
    .primary
    .darken(0.25)
    .fade(0.5)};

`

/******************************************************************************/
// Extends
/******************************************************************************/

Title.Sub = SubTitle

/******************************************************************************/
// Exports
/******************************************************************************/

export default Title

export {
  SubTitle
}
