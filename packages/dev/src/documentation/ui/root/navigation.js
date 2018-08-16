import React from 'react'
import styled from 'styled-components'

import is from 'is-explicit'
import { NavLink } from 'react-router-dom'

import { PropTypeSchema, string, arrayOf, object } from '@benzed/schema'
import { Flex, isEvent, storage } from '@benzed/react'

/******************************************************************************/
// Helper Components
/******************************************************************************/

const Nav = styled.nav`
  display: flex;
  align-items: flex-start;

  flex-wrap: wrap;
  flex-direction: column;
  flex-basis: 10em;

  padding: 0em 0.5em 0em 0.5em;
  margin: 0.5em 0em 0.5em 0em;

  color: ${props => props.theme.primary.darken(0.5).toString()};

  border-right: solid 1px ${props => props.theme.bg.darken(0.25).toString()};
`

/******************************************************************************/
// Helper
/******************************************************************************/

function getPackageSublinks (pkg) {

  const sublinks = pkg.reduce((names, exp) =>
    names.concat(Object
      .keys(exp)
      .map(e => e.toLowerCase()))
    , [])

  return sublinks
}

/******************************************************************************/
// ToggleLink
/******************************************************************************/

const MenuLink = styled(NavLink).attrs({
  exact: true
})`
  text-decoration: none;
  flex: 0 0 auto;
  font-weight: normal;

  transition: color 250ms, background-color 250ms, border-color 250ms;

  &:hover:not(.active) {
    color: ${props => props.theme.primary.darken(0.25).toString()};
  }

  &.active {
    font-weight: bold;
  }
`

const LinkList = styled(({ to, sublinks, ...props }) =>
  <ul {...props}>
    {sublinks.map(sublink => <li key={sublink}>
      <ToggleableMenuLink to={`${to}/${sublink}`} >
        {sublink}
      </ToggleableMenuLink>
    </li>)}
  </ul>
)`
  margin: 0em 0em 0em 0em;
  padding: 0em 0em 0em 0em;
  list-style-type: none;
  margin-left: 1em;
`

const Toggler = styled.button.attrs({
  // eslint-disable-next-line
  children: props => <span>{props.open ? '-' : '+'}</span>
})`
  background-color: ${props => props.theme.primary.toString()};
  width: 1em;
  height: 1em;
  padding: 0;

  display: flex;
  align-items: center;
  border-radius: 50%;

  margin-right: 0.25em;

  :disabled {
    opacity: 0;
    pointer-events: none;
  }

  span {
    font-size: 0.85em;
    font-weight: bold;
    pointer-events: none;
  }
`

class ToggleableMenuLink extends React.Component {

  static propTypes = new PropTypeSchema({
    to: string
  })

  state = {
    open: false
  }

  setOpen = open => {

    if (isEvent(open))
      open = !this.state.open

    this.setState({ open })
    storage.local.setItem(this.storageKey, open)
  }

  get hasSublinks () {
    const { sublinks } = this.props
    return sublinks && sublinks.length > 0
  }

  get storageKey () {
    const { to } = this.props
    return `toggle-link-open@${to}`
  }

  componentDidMount () {
    if (!this.hasSublinks)
      return

    const stored = storage.local.getItem(this.storageKey)
    if (!is.defined(stored))
      return

    this.setOpen(stored)
  }

  render () {

    const { children, to, sublinks } = this.props
    const { open } = this.state

    return [
      <Flex.Row key='link'>
        <Toggler
          key='toggler'
          open={open}
          disabled={!this.hasSublinks}
          onClick={this.setOpen}
        />
        <MenuLink to={to}>{children}</MenuLink>
      </Flex.Row>,

      this.hasSublinks && open
        ? <LinkList
          key='sublinks'
          to={to}
          sublinks={sublinks}
        />
        : null
    ]
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

const Navigation = ({ docs }) => {

  return <Nav>
    {Object.keys(docs).map(name =>
      <ToggleableMenuLink key={name}
        to={`/${name}`}
        sublinks={getPackageSublinks(docs[name])}>
        {name}
      </ToggleableMenuLink>
    )}
  </Nav>
}

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
