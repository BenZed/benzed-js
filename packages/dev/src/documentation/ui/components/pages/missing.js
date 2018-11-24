import React from 'react'
import styled from 'styled-components'

import Page from './page'
import { createPropTypesFor } from '@benzed/schema' // eslint-disable-line no-unused-vars

import $ from '../../../theme'

/******************************************************************************/
// Styled
/******************************************************************************/

const MissingPage = styled(Page)`
  margin: 1em;
`

const Band = styled.h1`

  background-color: ${$.theme.brand.primary};
  color: ${$.theme.brand.primary.darken(0.5)};

  h2 {
    font-size: 2.5em;
    margin-left: 0.5em;
  }

  padding: 0.25em;
`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Missing = ({ location }) =>

  <MissingPage>

    <Band>
      PAGE NOT FOUND
    </Band>

    <br/>

    <h2>{location.pathname} is not a valid page.</h2>

  </MissingPage>

/******************************************************************************/
// Prop Types
/******************************************************************************/

Missing.propTypes = createPropTypesFor(React =>
  <proptypes>
    <object key='location' required />
  </proptypes>)

/******************************************************************************/
// Exports
/******************************************************************************/

export default Missing
