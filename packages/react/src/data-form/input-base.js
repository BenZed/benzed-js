import React from 'react'
import styled from 'styled-components'

import is from 'is-explicit'
import { Label } from '../text'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const InputBase = styled(props => {

  const { label: _label = null, className, style, children } = props

  const label = is.string(_label)
    ? <Label>{_label}</Label>
    : _label

  return <div className={className} style={style}>
    { label } { children }
  </div>
})`

  display: flex;
  flex-direction: row;

  align-items: baseline;

  ${Label} {
    margin-right: 1em;
  }
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default InputBase
