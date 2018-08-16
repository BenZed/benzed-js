import React from 'react'
import styled from 'styled-components'

import Page from './page'
import { PropTypeSchema, object, required } from '@benzed/schema'

/******************************************************************************/
// Styled
/******************************************************************************/

const MissingPage = Page.extend``

const Band = styled.div`

  display: flex;
  flex: 0 1 5em;
  justify-content: center;

  background-color: ${props => props.theme.primary.toString()};
  color: ${props => props.theme.primary.darken(0.5).toString()};

  h2 {
    font-size: 2.5em;
    margin-left: 0.5em;
  }

  margin: 0.5em;
`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Missing = ({ location }) =>
  <MissingPage>
    <Band>
      <h2>
        {location.pathname} is not a valid path
      </h2>
    </Band>
  </MissingPage>

/******************************************************************************/
// Prop Types
/******************************************************************************/

Missing.propTypes = new PropTypeSchema({
  location: object(required)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default Missing
