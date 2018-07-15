import React from 'react'
import { GlobalStyle, Scroll } from '@benzed/react'

import Routes from './routes'
import Navigation from './navigation'

import theme from '../../theme'

/******************************************************************************/
// Main
/******************************************************************************/

const Website = ({ children, packages, ...props }) =>

  <GlobalStyle theme={theme}>
    <Navigation packages={packages} />
    <Scroll y>
      <Routes packages={packages} />
    </Scroll>
  </GlobalStyle>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Website
