import React from 'react'
import { createGlobalStyle as css, ThemeProvider } from 'styled-components'
import { createPropTypesFor } from '@benzed/schema'

import { $, Cloner } from '../util'

/******************************************************************************/
// TEMP
/******************************************************************************/

// This is a temporary way of creating a global style component that responds to
// themes until the createGlobalStyle api is finished in styled components.
// It's hacky and ugly, but it works.

/******************************************************************************/
// Helper
/******************************************************************************/

const GlobalStyle = css`

  * {
    box-sizing: border-box;
    flex: 0 0 auto;
    flex-direction: column;
  }

  footer, header, hgroup, menu, nav, section {
    display: block;
  }

  body {
    color: ${$.theme.fg};
    background-color: ${$.theme.bg};
    font-family: ${$.theme.fonts.body};
    line-height: 1;
  }

  pre {
    margin: 0em;
  }

  main {
    display: flex;
    width: 100vw;
    height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: ${$.theme.fonts.title};
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

  ol, ul {
    list-style: none;
  }

  blockquote, q {
    quotes: none;
  }
`

/******************************************************************************/
// Main Component
/******************************************************************************/

const ThemedGlobalStyle = ({ theme, children }) =>
  <ThemeProvider theme={theme}>
    <React.Fragment>
      <GlobalStyle />
      { children }
    </React.Fragment>
  </ThemeProvider>

/******************************************************************************/
// Prop Types
/******************************************************************************/

ThemedGlobalStyle.propTypes = createPropTypesFor(React => <proptypes>
  <object key='theme' required />
</proptypes>)

/******************************************************************************/
// Exports
/******************************************************************************/

export default ThemedGlobalStyle
