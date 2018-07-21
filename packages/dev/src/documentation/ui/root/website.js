import React from 'react'
import styled from 'styled-components'

import { GlobalStyle } from '@benzed/react'

import Routes from './routes'
import Navigation from './navigation'

import theme from '../../theme'

import { PropTypeSchema, any, arrayOf, object } from '@benzed/schema'

/******************************************************************************/
// Main Layout
/******************************************************************************/

const Main = styled.div`
  display: inherit;
  height: inherit;

  flex-direction: row;
`

/******************************************************************************/
// Main
/******************************************************************************/

const Website = ({ children, packages, ...props }) =>

  <GlobalStyle theme={theme}>
    <Main>
      <Navigation packages={packages} />
      <Routes packages={packages} />
    </Main>
  </GlobalStyle>

/******************************************************************************/
// Prop Types
/******************************************************************************/

Website.propTypes = new PropTypeSchema({
  children: any,
  packages: arrayOf(object)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default Website
