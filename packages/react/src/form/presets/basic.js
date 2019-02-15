import React from 'react'
import styled from 'styled-components'
import Form, { createFormPreset } from '../form'

import { Label } from '../../text'

import { last, wrap } from '@benzed/array'

import useForm from '../use-form'
import { $ } from '../../util'

/******************************************************************************/
// Helper
/******************************************************************************/

const InputColumn = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  flex-shrink: 1;

  input {
    width: 100%;
  }

  select {
    direction: rtl;
  }

  option {
    direction: rtl;
  }

  ul {

    display: flex;
    flex-direction: row;

    margin: 0em;
    padding: 0.25em;

    li {
      opacity: 0.5;

      &[data-selected=true] {
        text-decoration: none;
        opacity: 1;
      }

      &:not(:last-child) {
        margin-right: 0.4em;
      }
    }
  }

  input, select {
    text-align: inherit;
    border-color: ${$.ifProp('error').prop('theme', 'brand', 'danger').or.set('red').else.set('inherit')};
  }

`

const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 1;
  align-items: baseline;

  ${Label}:first-child {
    text-align: left;
    flex-basis: 4em;
    flex-shrink: 0;
    padding-right: 1em;
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

    <InputColumn error={!!_error}>
      {children}
      {error}
    </InputColumn>

  </ContainerRow>
}

/******************************************************************************/
// Components
/******************************************************************************/

/* eslint-disable indent */

const createBasicButtons = Buttons =>
  styled(Buttons)`
    display: flex;
    flex-direction: row;
    flex-grow: 1;

    margin-top: auto;

    button {

      background-color: ${$
        .prop('theme', 'brand', 'primary').fade(0.75)
          .or
        .prop('theme', 'brand', 'bg').fade(0.75)};

      background-color: ${$
        .ifBranded
          .set('white')
        .else
          .set('inherit')
      };

      &:not(:last-child) {
        margin-right: 1px;
      }
    }
  `

const createBasicComponent = Input =>

  props => {

    const { label, path, ...rest } = props

    const form = useForm()
    const error = useForm.errorAtPath(form, path)

    return <Container
        label={label}
        path={path}
        error={error}>

      <Input
        path={path}
        {...rest}
      />

    </Container>
  }

const BasicForm = styled.form`
  max-width: 15em;
  flex-grow: 1;
`

/******************************************************************************/
// EXports
/******************************************************************************/

export default createFormPreset(
  BasicForm::Form,
  (Input, key) => key === 'Buttons'
    ? createBasicButtons(Input)
    : createBasicComponent(Input)
)
