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

    typeDelay = TYPE_DELAY,
    type,

    schema, // not used, do not send to dom

    ...rest
  } = props

  const form = useForm.context()
  const value = useForm.valueAtPath(form, path)

  const delay = useDelay(form.pushCurrent, typeDelay)

  return <input

    onBlur={e => {
      form.pushCurrent()
      delay && delay.cancel()
      if (onBlur)
        onBlur(e)
    }}

    onChange={e => {

      const value = type === 'number'
        ? parseFloat(e.target.value)
        : e.target.value

      form.editCurrent(path, value)
      delay && delay.invoke()
      if (onChange)
        onChange(e)
    }}

    value={value || ''}

    type={type}

    {...rest}

  />
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default String

export {
  TYPE_DELAY
}
