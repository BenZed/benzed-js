import styled from 'styled-components'

import Label from './label'

/******************************************************************************/
// Main
/******************************************************************************/

const Title = styled.h1`
  margin: 0em 0.25em 0.25em 0.25em;
  padding: 0.25em;
  color: ${props => props
    .theme
    .primary
    .darken(0.5)
    .toString()};

  border-bottom: 1px solid ${props => props
    .theme
    .primary
    .darken(0.25)
    .fade(0.5)
    .toString()};

  display: flex;
  flex-direction: row;
  align-items: center;

  ${Label} {
    font-size: 0.6em;
    margin-left: auto;
  }
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Title
