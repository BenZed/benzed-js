import React from 'react'
import { injectGlobal, ThemeProvider } from 'styled-components'
import { PropTypeSchema, object, required } from '@benzed/schema'

import { Cloner } from '../util'

/******************************************************************************/
// TEMP
/******************************************************************************/

// This is a temporary way of creating a global style component that responds to
// themes until the createGlobalStyle api is finished in styled components.
// It's hacky and ugly, but it works.

/******************************************************************************/
// Helper
/******************************************************************************/

let tempInjectedGlobal = false

function tempInjectGlobal (theme) {

  tempInjectedGlobal = true

  injectGlobal`

    * {
      box-sizing: border-box;
      flex: 0 0 auto;
      flex-direction: column;
    }

    body {
      color: ${`${theme.fg}`};
      background-color: ${`${theme.bg}`};
      font-family: ${theme.body};
    }

    main {
      display: flex;
      width: 100vw;
      height: 100vh;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 0;
      font-family: ${theme.title};
    }

    a:link {
      color: inherit;
    }
    a:visited {
      color: inherit;
    }

    form {
      display: inherit;
    }

    input, button {
      outline: none;
      border: none;
      background-color: transparent;
      color: inherit;
    }

    button {
      cursor: pointer;
      padding: 0.5em;
    }

    input {

      padding: 0.25em;

      &::placeholder {
        color: inherit;
        opacity: 0.5;
      }

      border-bottom: 1px solid;

    }
  `
}

/******************************************************************************/
// Main Component
/******************************************************************************/

const GlobalStyle = ({ theme, children }) => {

  if (!tempInjectedGlobal)
    tempInjectGlobal(theme)

  return <ThemeProvider theme={theme}>
    <Cloner>{ children }</Cloner>
  </ThemeProvider>

}

/******************************************************************************/
// Prop Types
/******************************************************************************/

GlobalStyle.propTypes = new PropTypeSchema({

  theme: object(required)

})

/******************************************************************************/
// Exports
/******************************************************************************/

export default GlobalStyle
