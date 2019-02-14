import React from 'react'
import styled from 'styled-components'

import BasicInputContainer from './input'

import useFormInput from './use-form-input'
import { $, useDelay } from '../util'

import { Flex } from '../layout'

// import { $ } from '../themes'

/******************************************************************************/
//
/******************************************************************************/

const Input = styled.input`
  text-align: inherit;
  border-color: ${$.ifProp('dangerBorder').prop('theme', 'brand', 'danger')};
  margin-left: auto;

  display: flex;
  flex-grow: 1;
  width: 100%;
`

/******************************************************************************/
// Exports
/******************************************************************************/

const String = styled(props => {

  const {
    path,
    pushDelay = 300,
    Container = BasicInputContainer,
    ...rest
  } = props

  const { form, value, error } = useFormInput(path)
  const delay = useDelay(form.pushCurrent, pushDelay)

  return <Container
    {...rest}
    error={error}
    path={path}
  >

    <Input

      dangerBorder={!!error}

      onBlur={() => {
        form.pushCurrent()
        delay && delay.cancel()
      }}

      onChange={e => {
        form.editCurrent(path, e.target.value)
        delay && delay.invoke()
      }}

      value={value || ''}
    />

  </Container>
})`

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default String
