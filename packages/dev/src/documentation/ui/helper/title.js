import styled from 'styled-components'

import Label from './label'

/******************************************************************************/
// Main
/******************************************************************************/

const SubTitle = styled.h2`
  color: ${props => props
    .theme
    .brand
    .primary
    .darken(0.5)
    .toString()};

  display: flex;
  flex-direction: row;
  align-items: center;

  margin: 0.25em 0em 0.25em 0em;

  ${Label} {
    font-size: 0.6em;
    margin-left: auto;
  }
`

const Title = SubTitle.withComponent('h1').extend`

  padding: 0.25em 0.25em 0.25em 0em;

  border-bottom: 1px solid ${props => props
    .theme
    .brand
    .primary
    .darken(0.25)
    .fade(0.5)
    .toString()};

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
