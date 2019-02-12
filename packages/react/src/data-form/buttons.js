import React from 'react'
import styled from 'styled-components'

import { FormStateContext } from './form'
import { Flex } from '../layout'
import { $ } from '../util'

import { capitalize } from '@benzed/string'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const Button = styled.button`

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


  ${Button}:not(:last-child) {
    margin-right: 1px;
  }

`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Buttons = ({ children, ...props }) =>
  <FormStateContext.Consumer>{
    form =>

      <ButtonsContainer {...props}>

        { children != null
          ? <Flex.Row>{ children }</Flex.Row>
          : null
        }

        <Flex.Row>
          <Button
            brand='success'
            type='submit'
            disabled={!form.canSave}>
            Save
          </Button>

          <Button
            brand='warn'
            onClick={form.revert}
            disabled={!form.canSave}>
            {capitalize(form.revertType || '')}
          </Button>

          <Button
            brand='secondary'
            onClick={form.undo}
            disabled={!form.canUndo}>
            Undo
          </Button>

          <Button
            brand='secondary'
            onClick={form.redo}
            disabled={!form.canRedo}>
            Redo
          </Button>
        </Flex.Row>

      </ButtonsContainer>
  }
  </FormStateContext.Consumer>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Buttons
