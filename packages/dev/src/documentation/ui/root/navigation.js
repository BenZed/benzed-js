import React from 'react'
import styled from 'styled-components'

import is from 'is-explicit'
import { NavLink } from 'react-router-dom'

import { PropTypeSchema, string, arrayOf, object } from '@benzed/schema'
import { Flex, isEvent, storage } from '@benzed/react'
import { fromCamelCase } from '@benzed/string'

import $ from '../../theme'

/******************************************************************************/
// Helper Components
/******************************************************************************/

const Nav = styled.nav`
  display: flex;
  align-items: flex-start;

  flex-wrap: wrap;
  flex-direction: column;
  flex-basis: 15em;

  padding: 0em 0.5em 0em 0.5em;
  margin: 0.5em 0em 0.5em 0em;

  color: ${$.theme.brand.primary.darken(0.5)};

  > ul {
    margin-left: 0em;
  }

  border-right: solid 1px ${$.theme.bg.darken(0.5)};
`

/******************************************************************************/
// ToggleLink
/******************************************************************************/

const LinkRow = Flex.Row.extend`
  margin: 0.25em 0em 0.25em 0em;
`

const Link = styled(NavLink)`
  text-decoration: none;
  flex: 0 0 auto;
  font-weight: normal;

  transition: color 250ms, background-color 250ms, border-color 250ms;

  &:hover:not(.active) {
    color: ${$.theme.brand.primary.darken(0.25)};
  }

  &.active {
    font-weight: bold;
  }
`

const Toggle = styled.button.attrs({
  // eslint-disable-next-line
  children: props => <span>{props.open ? '-' : '+'}</span>
})`
  background-color: ${$.theme.brand.primary};
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

class ToggleLink extends React.Component {

  static propTypes = new PropTypeSchema({
    prefix: string
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

  get hasChildren () {
    const { doc } = this.props
    return doc && doc.children && doc.children.length > 0
  }

  get storageKey () {
    // TODO fix me
    const { doc, prefix = '' } = this.props
    return `toggle-link-open@${prefix}/${doc.name::fromCamelCase()}`
  }

  componentDidMount () {
    if (!this.hasChildren)
      return

    const stored = storage.local.getItem(this.storageKey)
    if (!is.defined(stored))
      return

    this.setOpen(stored)
  }

  render () {

    const { doc, prefix = '' } = this.props
    const { open } = this.state

    const to = `${prefix}/${doc.name::fromCamelCase()}`

    return [
      <LinkRow key='link'>
        <Toggle
          key='toggler'
          open={open}
          disabled={!this.hasChildren}
          onClick={this.setOpen}
        />
        <Link to={to}>{ doc.name::fromCamelCase() }</Link>
      </LinkRow>,

      this.hasChildren && open
        ? <LinkList
          key='children'
          prefix={to}
          docs={doc.children}
        />
        : null
    ]
  }
}

const LinkList = styled(({ prefix, docs, ...props }) =>
  <ul {...props}>
    {docs.map((doc, i) => <li key={i}>
      <ToggleLink prefix={prefix} doc={doc} />
    </li>)}
  </ul>
)`
  margin: 0em 0em 0em 0em;
  padding: 0em 0em 0em 0em;
  list-style-type: none;
  margin-left: 1em;
`

/******************************************************************************/
// Main
/******************************************************************************/

const Navigation = ({ docs }) => {

  const repos = docs.length > 1
    ? docs
    : docs[0].children

  return <Nav>
    <LinkList prefix='' docs={repos} />
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
