import React from 'react'
import styled from 'styled-components'

import Input from './input-base'

import useFormInput from './use-form-input'
import { useDelay } from '../util'

/******************************************************************************/
// Exports
/******************************************************************************/

const String = styled(props => {

  const {
    path, ...rest
  } = props

  const { form, value, error } = useFormInput(path)
  const delay = useDelay(form.pushCurrent, 300)

  return <Input

    error={!!error}

    onBlur={() => {
      form.pushCurrent()
      delay.cancel()
    }}

    onChange={e => {
      form.editCurrent(path, e.target.value)
      delay.invoke()
    }}

    value={value || ''}

    {...rest}

  />
})`
  text-align: right;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default String
