import React from 'react'
import styled from 'styled-components'
import { FormStateContext } from './form'
import { $ } from '../util'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const Button = styled.button`

  background-color: ${$.branded.or.prop('theme', 'fg')};
  color: ${$.ifBranded.set('white').else.prop('theme', 'bg')};

  &:disabled {
    background-color: ${$.prop('theme', 'fg').desaturate(1)};
    color: ${$.prop('theme', 'bg').desaturate(1)};
    opacity: 0.5;
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
    form => {

      const canSave = form.hasChangesToCurrent

      return <ButtonsContainer {...props}>
        <Button brand='success' type='submit' >Save</Button>
        <Button >Cancel</Button>
        <Button >Revert</Button>
        <Button >Undo</Button>
        <Button >Redo</Button>
        { children }
      </ButtonsContainer>
    }
  }</FormStateContext.Consumer>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Buttons
