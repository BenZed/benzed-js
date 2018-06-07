import React from 'react'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function nestInComponent (Child, Parent) {

  if (this !== undefined) {
    Parent = Child
    Child = this
  }

  if (!is.object(Parent.propTypes))
    throw new Error('propTypes must be defined in parent component')

  const Nested = ({ children, ...props }) => {

    const parentProps = {}
    const childProps = {}

    for (const key in props)
      if (key in Parent.propTypes)
        parentProps[key] = props[key]
      else
        childProps[key] = props[key]

    return <Parent {...parentProps}>
      <Child {...childProps}>
        { children }
      </Child>
    </Parent>

  }

  return Nested

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default nestInComponent
