import React from 'react'
import styled from 'styled-components'

import { NavLink } from 'react-router-dom'
import { PropTypeSchema, arrayOf, object } from '@benzed/schema'

/******************************************************************************/
// Helper Components
/******************************************************************************/

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: flex-start;

  padding: 0.5em;
  text-transform: uppercase;

  background-color: ${props => props.theme.primary.toString()};
  color: ${props => props.theme.primary.darken(0.5).toString()};

  a {
    text-decoration: none;
    font-size: 0.825em;
    flex: 0 0 auto;

    margin: 0.25em 0em 0.25em 0em;
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

/******************************************************************************/
// Main
/******************************************************************************/

const Navigation = ({ packages }) =>

  <Nav>
    {packages.map(pkg =>
      <NavLink
        key={pkg.name}
        to={`/${pkg.name}`}
        activeClassName='active'>
        {pkg.name}
      </NavLink>
    )}
  </Nav>

/******************************************************************************/
// Prop Types
/******************************************************************************/

Navigation.propTypes = new PropTypeSchema({
  packages: arrayOf(object)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default Navigation
