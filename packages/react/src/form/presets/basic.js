import React from 'react'
import styled from 'styled-components'
import Form from '../form'

import { Label } from '../../text'

import { last, wrap } from '@benzed/array'

import useForm from '../use-form'

/******************************************************************************/
// Helper
/******************************************************************************/

const InputColumn = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;

  *:first-child {
    text-align: inherit;
  }

`

const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;

  ${Label}:first-child {
    text-align: left;
    flex-basis: 4em;
    flex-shrink: 0;
  }
`

const Container = props => {

  const {
    label: _label,
    error: _error,
    path,
    children
  } = props

  const label = _label !== false
    ? <Label>{_label || last(wrap(path))}</Label>
    : null

  const error = _error
    ? <Label brand='danger'>
      {_error}
    </Label>
    : null

  return <ContainerRow>
    {label}
    <InputColumn>
      {children}
      {error}
    </InputColumn>
  </ContainerRow>
}

/******************************************************************************/
// Components
/******************************************************************************/

function BasicComponent (props) {

  const InputComponent = this
  const { label, path, ...rest } = props

  const { form, value, error } = useForm(path)

  return <Container label={label} path={path} error={error}>
    <InputComponent
      form={form}
      value={value}
      path={path}
      {...rest}
    />
  </Container>
}

const BasicForm = styled.form`
  max-width: 12em;
`

const BASIC_COMPONENT_MAP = Object.entries(Form.inputMap)
  .reduce((map, entry) => {
    const [ name, component ] = entry

    map[name] = component::BasicComponent

    return map
  }, {})

/******************************************************************************/
// EXports
/******************************************************************************/

export default Form.createPreset({
  Form: BasicForm,
  ...BASIC_COMPONENT_MAP
})
