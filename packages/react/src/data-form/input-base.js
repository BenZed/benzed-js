import React, { cloneElement, useContext } from 'react'

import is from 'is-explicit'
import { Label } from '../text'
import { FormStateContext } from './form'
import { Flex } from '../layout'

import { last } from '@benzed/array'
import { get } from '@benzed/immutable'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const InputBase = props => {

  const {
    path,
    label: _label = last(path),
    direction = 'row',
    items = 'baseline',
    children,
    ...rest } = props

  const label = is.string(_label)
    ? <Label>{_label}</Label>
    : _label

  const form = useContext(FormStateContext)
  const value = get.mut(form.current, path)
  console.log({ form, path, value })

  return <Flex direction={direction} items={items} {...rest}>
    { label }
    { cloneElement(children, { form, value, path }) }
  </Flex>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default InputBase
