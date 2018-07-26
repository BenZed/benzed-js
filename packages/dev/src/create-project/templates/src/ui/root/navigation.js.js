
export default ({ ui, routing, pretty }) => ui && routing && pretty`
import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

/******************************************************************************/
// Styled Components
/******************************************************************************/

const Nav = styled.nav\`
  padding: 0.5em;

  a {
    font-size: 0.75em;
    text-transform: uppercase;
    text-decoration: none;
  }

  a:not(:last-child) {
    margin-right: 0.5em;
  }

  a.active {
    text-decoration: underline;
  }

\`

/******************************************************************************/
// Navigation Component Goes Here TODO
/******************************************************************************/

const Navigation = () =>
  <Nav>
    <NavLink to='/' exact>Home</NavLink>
    <NavLink to='/about' >About</NavLink>
  </Nav>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Navigation
`
