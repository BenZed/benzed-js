import React from 'react'

import useForm from '../use-form'
import is from 'is-explicit'

/******************************************************************************/
// Children Render Function
/******************************************************************************/

const checkOrX = value => value ? '√' : 'x'

/******************************************************************************/
// Main
/******************************************************************************/

const Boolean = props => {

  const {
    path,

    onClick,

    children = checkOrX,

    schema, // not used, do not send to dom

    ...rest
  } = props

  const form = useForm.context()
  const value = useForm.valueAtPath(form, path)

  return <button

    onClick={e => {

      e.preventDefault()

      form.editCurrent(path, !value)
      form.pushCurrent()
      if (onClick)
        onClick(e)
    }}

    value={value}

    {...rest}

  >
    {
      is.func(children)
        ? children(value)
        : children
    }
  </button>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Boolean
