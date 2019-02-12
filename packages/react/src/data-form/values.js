import React from 'react'
import styled from 'styled-components'

import Input from './input-base'
import useFormInput from './use-form-input'

import { $ } from '../util'

import { first } from '@benzed/array'

/******************************************************************************/
//
/******************************************************************************/

const Value = styled.button`

  font-family: ${$.theme.fonts.mono};
  font-weight: ${$.ifProp('active').set('bold').else.set('normal')};

  color: ${$.branded.or.theme.fg};
  opacity: ${$.ifProp('active').set(1).else.set(0.75)};

  text-decoration: ${$.ifProp('active').set('underline').else.set('none')};

  padding: 0.25em;

`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Values = styled(props => {

  const {
    path, values, ...rest
  } = props

  const { form, value: selected = first(values) } = useFormInput(path)

  return <Input as='div' {...rest} >

    {values.map(value =>
      <Value
        key={value}
        active={selected === value}
        onClick={e => {
          e.preventDefault()
          form.editCurrent(path, value)
          form.pushCurrent()
        }}
      >
        {value}
      </Value>)
    }

  </Input>
})`

  > ${Value}:first-child {
    margin-left: auto;
  }

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Values
