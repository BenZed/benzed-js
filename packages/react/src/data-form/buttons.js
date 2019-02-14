import React from 'react'
import styled from 'styled-components'

import { Flex } from '../layout'
import { $ } from '../util'

import useFormInput from './use-form-input'

import { capitalize } from '@benzed/string'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const FormButton = styled.button`

  display: flex;
  flex-grow: 1;
  align-items: center;

  background-color: ${$.branded.darken(0.125).or.prop('theme', 'fg')};
  color: ${$.ifBranded.set('white').else.prop('theme', 'bg')};

  &:disabled {
    background-color: ${$.prop('theme', 'fg').desaturate(1)};
    color: ${$.prop('theme', 'bg').desaturate(1)};
    opacity: 0.5;
    cursor: not-allowed;
  }

`

const ButtonsContainer = styled(Flex.Column)`

  margin-top: auto;


  ${FormButton}:not(:last-child) {
    margin-right: 1px;
  }

`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Buttons = ({ children, ...props }) => {

  const { form } = useFormInput()

  return <ButtonsContainer {...props}>

    { children != null
      ? <Flex.Row>{ children }</Flex.Row>
      : null
    }

    <Flex.Row>
      <FormButton
        brand='success'
        type='submit'
        disabled={form.saving || !form.canSave}>
        {form.saving ? 'Saving' : 'Save'}
      </FormButton>

      <FormButton
        brand='warn'
        onClick={form.revert}
        disabled={!form.canSave}>
        {capitalize(form.revertType || '')}
      </FormButton>

      <FormButton
        brand='secondary'
        onClick={form.undo}
        disabled={!form.canUndo}>
        Undo
      </FormButton>

      <FormButton
        brand='secondary'
        onClick={form.redo}
        disabled={!form.canRedo}>
        Redo
      </FormButton>

    </Flex.Row>

  </ButtonsContainer>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Buttons
