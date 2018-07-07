import React from 'react'

import styled, { ThemeProvider } from 'styled-components'

import { Login } from '../../app'
import { GlobalStyle } from '../../themes'

/******************************************************************************/
// Main
/******************************************************************************/

const Nav = styled.nav`
  display: flex;
  flex-direction: row;

  justify-content: space-around;
  align-items: center;

  height: 1.5em;
  font-size: 1.25em;

  color: ${props => props.theme.bg};
  background-color: ${props => props.theme.fg};

`

const Scroll = styled.div`
  flex: 1 1 auto;
  overflow: auto;
`

const Flex = styled.div`
  display: flex;
`

Flex.Column = Flex.extend`
  flex-direction: column;
`

Flex.Row = Flex.extend`
  flex-direction: row;
`

const Example = ({ arr }) =>
  <ThemeProvider theme={{
    bg: 'black',
    fg: 'white',
    body: 'Helvetica',
    title: 'Impact' }}
  >
    <GlobalStyle>

      <Nav>
        <a href='http://www.google.com'>google</a>
        <a href={`http://www.google.com?time=${Date.now()}`}>double google</a>
      </Nav>

      <Scroll>
        <Flex.Column>
          <form>
            <input placeholder='thoughts' />
            <input placeholder='feelings' />
            <button>worries</button>
          </form>

          <div style={{ width: '25em', height: '25em' }}>
            Square
          </div>
        </Flex.Column>
      </Scroll>

    </GlobalStyle>
  </ThemeProvider>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Example
