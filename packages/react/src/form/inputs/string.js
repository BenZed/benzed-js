import React from 'react'

import useForm from '../use-form'

import { useDelay } from '../../util'

/******************************************************************************/
// Data
/******************************************************************************/

const TYPE_DELAY = 300 // ms

/******************************************************************************/
// Main
/******************************************************************************/

const String = props => {

  const {
    path,

    onBlur,
    onChange,
    form = useForm.context(),
    value = useForm.valueAtPath(form, path),

    typeDelay = TYPE_DELAY,

    ...rest
  } = props

  const delay = useDelay(form.pushCurrent, typeDelay)

  return <input

    onBlur={e => {
      form.pushCurrent()
      delay && delay.cancel()
      if (onBlur)
        onBlur(e)
    }}

    onChange={e => {
      form.editCurrent(path, e.target.value)
      delay && delay.invoke()
      if (onChange)
        onChange(e)
    }}

    value={value || ''}

    {...rest}

  />
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default String
