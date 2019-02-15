import React from 'react'

import useForm from '../use-form'

/******************************************************************************/
// Main
/******************************************************************************/

const Boolean = props => {

  const {
    path,

    onClick,

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

  >{value ? '√' : 'x'}</button>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Boolean
