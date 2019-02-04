import React from 'react'

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

  return <FormStateContext.Consumer>{
    ({ onChange, current }) =>

      <Flex direction={direction} items={items} {...rest}>
        { label }
        {
          children({
            'value': get.mut(current, path),
            'data-path': path,
            onChange
          })
        }
      </Flex>

  }</FormStateContext.Consumer>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default InputBase
