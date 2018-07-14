import React from 'react'

import { ThemeProvider } from 'styled-components'

import { GlobalStyle } from '../../themes'

/******************************************************************************/
// Main
/******************************************************************************/

const Example = ({ arr }) =>
  <ThemeProvider theme={{
    bg: 'white',
    fg: 'black',
    body: 'Helvetica',
    title: 'Impact' }}>
    <GlobalStyle>

    </GlobalStyle>
  </ThemeProvider>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Example
