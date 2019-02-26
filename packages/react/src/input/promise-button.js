import React, { useState } from 'react'
import is from 'is-explicit'

/******************************************************************************/
// Main Component
/******************************************************************************/

const PromiseButton = props => {

  const { children, onClick, disabled, ...rest } = props

  const [ resolving, setResolving ] = useState(false)

  const resolveOnClick = async e => {
    setResolving(true)
    await (onClick && onClick(e))
    setResolving(false)
  }

  return <button
    onClick={resolveOnClick}
    disabled={resolving || disabled}
    data-resolving={resolving}
    {...rest}
  >
    {is.func(children) ? children(resolving) : children}
  </button>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default PromiseButton
