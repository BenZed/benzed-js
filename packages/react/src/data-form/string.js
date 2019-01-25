import React from 'react'
import styled from 'styled-components'
import InputBase from './input-base'

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

const String = ({ children, path, ...props }) =>

  <InputBase path={path} >{
    ({ value = '', ...rest }) =>
      <Input value={value} {...rest} {...props} />
  }</InputBase>

/******************************************************************************/
// Exports
/******************************************************************************/

export default String
