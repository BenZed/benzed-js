import React from 'react'
import styled from 'styled-components'
import { FormStateContext } from './form'
import { $ } from '../util'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const Button = styled.button`

  background-color: ${$.branded.darken(0.125).or.prop('theme', 'fg')};
  color: ${$.ifBranded.set('white').else.prop('theme', 'bg')};

  &:disabled {
    background-color: ${$.prop('theme', 'fg').desaturate(1)};
    color: ${$.prop('theme', 'bg').desaturate(1)};
    opacity: 0.5;
    cursor: not-allowed;
  }

`

const ButtonsContainer = styled.div`

  margin-top: auto;

  display: flex;
  flex-direction: row;
  align-content: stretch;

  ${Button} {
    display: flex;
    flex-grow: 1;
  }

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
        <Button
          brand='success'
          type='submit'
          disabled={!form.hasChangesToCurrent}>
          Save
        </Button>

        <Button
          brand='warn'
          onClick={form.revertCurrentToOriginal}
          disabled={!form.hasChangesToCurrent}>
          Cancel
        </Button>

        <Button
          brand='danger'
          onClick={form.revertToUpstream}
          disabled={!form.hasChangesToUpstream}>
          Revert
        </Button>

        <Button
          brand='secondary'
          onClick={form.undoEditCurrent}
          disabled={!form.canUndoEditCurrent}>
          Undo
        </Button>

        <Button
          brand='secondary'
          onClick={form.redoEditCurrent}
          disabled={!form.canRedoEditCurrent}>
          Redo
        </Button>

        { children }

      </ButtonsContainer>
  }
  </FormStateContext.Consumer>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Buttons
