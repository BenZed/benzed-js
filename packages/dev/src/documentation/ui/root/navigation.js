import React from 'react'
import styled from 'styled-components'

import { NavLink } from 'react-router-dom'

/******************************************************************************/
// Helper Components
/******************************************************************************/

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  padding: 0.5em;

  text-transform: uppercase;

  background-color: ${props => props.theme.primary.toString()};
  color: ${props => props.theme.primary.darken(0.5).toString()};

  a {
    text-decoration: none;
    font-size: 0.825em;
    flex: 0 0.5 auto;

    margin: auto 1em auto 0em;
    padding: 0.1em;
    border-bottom: 2px solid transparent;
    transition: color 250ms, background-color 250ms, border-color 250ms;

  }

  a:hover:not(.active) {
    color: ${props => props.theme.primary.darken(0.25).toString()};
  }

  a.active {
    border-color: ${props => props.theme.primary.darken(0.5).toString()}
  }


`
//
// const SearchInput = styled.input`
//   margin-left: auto;
//   padding: 0;
//   border-width: 2px;
//   ::placeholder {
//     font-style: italic;
//   }
// `

/******************************************************************************/
// Main
/******************************************************************************/

const Navigation = ({ packages }) => {

  return <Nav>
    {packages
      .map(pkg =>
        <NavLink
          key={pkg.name}
          to={`/${pkg.name}`}
          activeClassName='active'>
          {pkg.name}
        </NavLink>)}
    {/* <SearchInput placeholder='Search' /> */}
  </Nav>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Navigation
