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

    margin-top: auto;

    button {

      flex-grow: 1;
      align-items: center;

      transition: color 150ms, background-color 150ms;

      background-color: ${$
        .prop('theme', 'brand', 'primary')
          .or
        .prop('theme', 'bg').fade(0.6)};

      color: ${$
        .ifProp('theme', 'brand', 'primary')
          .set('white')
        .else
          .set('inherit')
      };

      &:not(:last-child) {
        margin-right: 1px;
      }

      &:disabled {
        background-color: ${$
          .prop('theme', 'fg').fade(0.75)};

        color: ${$
          .prop('theme', 'fg')};

        };
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

const BasicErrorLabel = styled(({ error, ...props }) =>

  <button {...props}>
    <h3>{error.name}</h3>
    <label>{error.message}</label>
  </button>
)`

  background-color: ${$.prop('theme', 'brand', 'danger').lighten(0.5).fade(0.125)};
  position: absolute;
  top: 0em;
  left: 0em;

  width: 100%;
  text-align: left;

  padding: 0.5em;
  font-family: ${$.prop('theme', 'font', 'mono').or.set('monospace')};

  h3 {
    color: ${$.prop('theme', 'brand', 'danger').darken(0.25)};
    margin-bottom: 0.25em;
  }

  label {
    color: ${$.prop('theme', 'brand', 'danger').darken(0.125)};
  }

`

const BasicForm = styled(({ children, ...props }) => {

  const form = useForm()
  useForm.observe(form, 'error')

  const error = form.error

  return <form data-error={!!error} {...props}>
    {error
      ? <BasicErrorLabel onClick={e => {
        e.preventDefault()
        form.clearError()
      }} error={error} />

      : null
    }
    {children}
  </form>
})`
  max-width: 20em;
  flex-grow: 1;

  &[data-error=true] {
    outline: 1px solid ${$.prop('theme', 'brand', 'danger').or.set('red')};
    outline-offset: calc(0.5em - 1px);
  }
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
