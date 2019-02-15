import React from 'react'
import { createGlobalStyle as css, ThemeProvider } from 'styled-components'
import { createPropTypesFor } from '@benzed/schema'

import { $ } from '../util'

/******************************************************************************/
// Data
/******************************************************************************/

const SELECT_ARROW_SVG = `data:image/svg+xml;utf8,<?xml version="1.0" ` +
  `encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ` +
  `"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg ` +
  `xmlns="http://www.w3.org/2000/svg" width="14" height="12" version="1">` +
  `<path d="M4 8L0 4h8z"/></svg>`

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

  input, button, select {
    outline: none;
    border: none;
    background-color: transparent;
    color: inherit;

    &:disabled {
      opacity: 0.5;
    }
  }

  button {
    cursor: pointer;
    padding: 0.5em;
  }

  input, select {

    padding: 0.25em;

    &::placeholder {
      color: inherit;
      opacity: 0.5;
    }

    border-bottom: 1px solid;

  }

  select {
    appearance: none;

    &:not([multiple]) {
      background-image: url('${SELECT_ARROW_SVG}');
      background-repeat: no-repeat;
      background-position: right 50%;
      padding-right: 1.25em;
    }

    cursor: pointer;
    border-radius: 0em;
  }

  ::selection {
    background: ${$.theme.fg.fade(0.8)};
  }

  ol, ul {
    list-style: none;
  }

  ul[data-selectable=true] {
    user-select: none;

    li {
      cursor: pointer;
    }

    li[data-selected=true] {
      text-decoration: underline;
    }
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
