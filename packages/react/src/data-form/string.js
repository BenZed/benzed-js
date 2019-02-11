import React, { useEffect, useRef, useContext } from 'react'
import styled from 'styled-components'

import { Flex } from '../layout'
import { Label } from '../text'

import { FormStateContext } from './form'

import { get } from '@benzed/immutable'
import { last } from '@benzed/array'

/******************************************************************************/
// Styles
/******************************************************************************/

const Input = styled.input`
  flex-grow: 1;
  flex-shrink: 1;
  width: 100%;
  text-align: right;
`

/******************************************************************************/
// useFormInput Hook TODO move me
/******************************************************************************/

const useFormInput = path => {

  const form = useContext(FormStateContext)
  const value = get.mut(form.current, path)

  return { form, value }

}

/******************************************************************************/
// useDelayedInvocation Hook TODO move me
/******************************************************************************/

function cancelDelayedInvocation () {
  if (this.id !== null)
    clearTimeout(this.id)

}

function invokeCallbackAferDelay () {
  if (this.id !== null)
    this.cancel()
  this.id = setTimeout(this.callback, this.delay)
}

const useDelayedInvocation = (callback, delay) => {

  const timerRef = useRef()

  useEffect(() => {

    timerRef.current = {
      id: null,
      invoke: invokeCallbackAferDelay,
      cancel: cancelDelayedInvocation,
      callback,
      delay
    }

    return () => {
      timerRef.current.cancel()
    }
  }, [ callback, delay ])

  return timerRef.current
}

/******************************************************************************/
// Exports
/******************************************************************************/

const String = ({ children, path, label, ...props }) => {

  const { form, value } = useFormInput(path)
  const delay = useDelayedInvocation(form.pushCurrent, 300)

  return <Flex.Row {...props}>
    <Label>{label || last(path)}</Label>
    <Input
      onBlur={() => {
        form.pushCurrent()
        delay.cancel()
      }}
      onChange={e => {
        form.editCurrent(path, e.target.value)
        delay.invoke()
      }}
      value={value}
    />
  </Flex.Row>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default String
