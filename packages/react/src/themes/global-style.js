import styled, { injectGlobal, withTheme } from 'styled-components'
import React from 'react'

// import { $ } from '../util'

/******************************************************************************/
// TEMP
/******************************************************************************/

// This is a temporary way of creating a global style component that responds to
// themes until the createGlobalStyle api is finished in styled components.
// It's hacky and ugly, but it works.

/******************************************************************************/
// Helper
/******************************************************************************/

function tempInjectGlobal (theme) {

  injectGlobal`

    * {
      box-sizing: border-box;
      flex: 0 0 auto;
      flex-direction: column;
    }

    body {
      color: ${theme.fg};
      background-color: ${theme.bg};
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

class GlobalStyle extends React.Component {

  static mounted = false

  componentDidMount () {
    if (GlobalStyle.mounted)
      throw new Error('Cannot mount the GlobalStyle component twice.')

    GlobalStyle.mounted = true

    tempInjectGlobal(this.props.theme)
  }

  componentWillUnmount () {
    throw new Error('Cannot dismount the GlobalStyle component.')
  }

  render () {
    return this.props.children
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default withTheme(GlobalStyle)
