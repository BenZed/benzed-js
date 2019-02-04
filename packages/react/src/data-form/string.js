import React from 'react'
import styled from 'styled-components'
import InputBase from './input-base'
import is from 'is-explicit'

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
// Main Component
/******************************************************************************/

const String = ({ children, ...props }) =>

  <InputBase {...props} >{
    ({ value, ...rest }) =>
      <Input
        value={is.defined(value) ? value : ''}
        {...rest}
      />
  }</InputBase>

/******************************************************************************/
// Exports
/******************************************************************************/

export default String
