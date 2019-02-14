import React, { useState } from 'react'
import is from 'is-explicit'

/******************************************************************************/
// Main Component
/******************************************************************************/

const PromiseButton = props => {

  const { children, onClick, disabled, component = 'button', ...rest } = props

  const [ resolving, setResolving ] = useState(false)

  const resolveOnClick = async e => {
    setResolving(true)
    await (onClick && onClick(e))
    setResolving(false)
  }

  const Component = component

  return <Component
    onClick={resolveOnClick}
    disabled={resolving || disabled}
    {...rest}
  >
    {is.func(children) ? children(resolving) : children}
  </Component>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default PromiseButton
