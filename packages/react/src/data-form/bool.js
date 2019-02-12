import React from 'react'
import styled from 'styled-components'

import Input from './input-base'
import useFormInput from './use-form-input'

import { $ } from '../util'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Checkbox = styled.button.attrs(props => ({
  children: <span>{props.value ? '√' : 'x'}</span>
}))`
  width: 1em;
  height: 1em;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0em;
  overflow: hidden;

  &:hover {
    opacity: 0.75;
  }

  span {
    font-size: 0.7em;
  }

  background-color: ${$.branded.or.theme.fg};
  color: ${$.ifBranded.set('white').else.theme.bg};
  border-radius: 50%;
`

const Boolean = styled(props => {

  const {
    path, ...rest
  } = props

  const { form, value } = useFormInput(path)

  return <Input as='div' {...rest} >
    <Checkbox
      value={!!value}
      onClick={e => {
        e.preventDefault()
        form.editCurrent(path, !value)
        form.pushCurrent()
      }}
    />
  </Input>
})`

  ${Checkbox} {
    margin-left: auto;
  }

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Boolean
