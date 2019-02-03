import React from 'react'
import styled from 'styled-components'

import is from 'is-explicit'
import { Label } from '../text'
import { FormStateContext } from './form'

import { last } from '@benzed/array'
import { get } from '@benzed/immutable'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const InputBase = styled(props => {

  const { path, label: _label = last(path), className, style, children } = props

  const label = is.string(_label)
    ? <Label>{_label}</Label>
    : _label

  return <FormStateContext.Consumer>{
    ({ onChange, current }) =>

      <div className={className} style={style}>
        { label }
        {
          children({
            'value': get.mut(current, path),
            'data-path': path,
            onChange
          })
        }
      </div>

  }</FormStateContext.Consumer>
})`

  display: flex;
  flex-direction: row;
  flex-grow: 1;
  flex-shrink: 1;

  align-items: baseline;

  ${Label} {
    margin-right: 1em;
  }
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default InputBase
