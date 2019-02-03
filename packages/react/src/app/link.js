import React from 'react'
import { StateTreeListener } from '../state-tree-observer'
import is from 'is-explicit'
import { copy } from '@benzed/immutable'

// TODO don't know where to put this

/******************************************************************************/
// Main Component
/******************************************************************************/

const UiLink = ({ children, to, query, ...props }) =>
  <StateTreeListener root='ui' path='location'>{
    ui => {

      const onClick = e => {
        e.preventDefault()

        query = query === true
          ? copy(ui.location.query)
          : is.func(query)
            ? query(e, ui.location.query)
            : is.plainObject(query)
              ? query
              : undefined

        ui.navigate(to, query)
      }

      return <a {...props} href={to} onClick={onClick} >{children}</a>
    }
  }</StateTreeListener>

/******************************************************************************/
// Exports
/******************************************************************************/

export default UiLink
