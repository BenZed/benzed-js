import React, { createContext } from 'react'
import styled from 'styled-components'

import { Flex } from '../layout'

import { equals } from '@benzed/immutable'

import { $ } from '../util'

/******************************************************************************/
// Context
/******************************************************************************/

const FormStateContext = createContext()

const StyledForm = styled(Flex).attrs({ as: 'form' })`
  outline: solid ${$.prop('theme', 'brand', 'danger')};
  outline-width: ${$.ifProp('error').set(1).else.set(0)}px;
  outline-offset: calc(0.5em - 1px);
`

const ErrorButton = styled.button.attrs(props => ({ children: props.error.message }))`
  background-color: ${$.prop('theme', 'brand', 'danger').lighten(0.5).fade(0.3)};
  color: ${$.prop('theme', 'brand', 'danger').darken(0.25)};

  min-width: 100%;

  position: absolute;
  top: 0em;
  left: 0em;

  align-items: center;

  padding: 0.5em;
`

/******************************************************************************/
// Logic
/******************************************************************************/

class Form extends React.Component {

  state = {
    current: {},
    error: null,
    history: [],
    onChange: () => {}
  }

  // Form Event Handlers

  handleSubmit = async e => {

    e.preventDefault()

    const { form } = this.props

    form.pushCurrent()
    await form.pushUpstream()

  }

  handleChange = e => {

    const { form } = this.props

    const path = (e.target.dataset.path || '').split(',')

    if (path && path.length > 0)
      form.editCurrent(path, e.target.value)
    else
      throw new Error('path not specified in event.target.dataset')
  }

  clearError = e => {
    e.preventDefault()
    this.props.form.clearError()
  }

  revert = e => {
    e.preventDefault()
    this.props.form.revertToUpstream()
  }

  undo = e => {
    e.preventDefault()
    this.props.form.undoEditCurrent()
  }

  redo = e => {
    e.preventDefault()
    this.props.form.redoEditCurrent()
  }

  // State Setters

  createFormWithEventHandlers = (form = this.props.form) => {

    const { current, error, history, historyIndex } = form

    const {
      hasChangesToUpstream: canSave,
      canRedoEditCurrent: canRedo,
      canUndoEditCurrent: canUndo,
      pushCurrent,
      editCurrent
    } = form

    const { handleChange, clearError, revert, redo, undo } = this

    const revertType = form.upstreamTimestamp > form.currentTimestamp
      ? 'revert' : 'cancel'

    const formDataWithEventHandlers = {
      error,
      current,
      history,
      historyIndex,

      handleChange,
      pushCurrent,
      editCurrent,

      canSave,
      revert,
      revertType,

      canRedo,
      redo,

      canUndo,
      undo,

      clearError
    }

    if (equals(formDataWithEventHandlers, this.state))
      return

    this.setState(formDataWithEventHandlers)
  }

  componentDidMount () {
    const { form } = this.props
    if (!form)
      throw new Error('form state is required')

    form.subscribe(this.createFormWithEventHandlers)
    this.createFormWithEventHandlers()
  }

  componentWillUnmount () {
    const { form } = this.props
    form.unsubscribe(this.createFormWithEventHandlers)
  }

  componentDidUpdate (prev) {

    const { form: oldForm } = prev
    const { form: newForm } = this.props

    if (oldForm !== newForm) {
      oldForm.unsubscribe(this.createFormWithEventHandlers)

      newForm.subscribe(this.createFormWithEventHandlers)
      this.createFormWithEventHandlers()
    }
  }

  render () {
    const { children, form, ...props } = this.props
    const { error } = this.state

    return <FormStateContext.Provider value={this.state}>
      <StyledForm
        error={!!error}
        onSubmit={this.handleSubmit}
        {...props}
      >

        {
          error
            ? <ErrorButton error={error} onClick={form.clearError} />
            : null
        }

        {children}

      </StyledForm>
    </FormStateContext.Provider>
  }

}

/******************************************************************************/
// Extend
/******************************************************************************/

Form.StateProvider = FormStateContext.Provider
Form.StateConsumer = FormStateContext.Consumer
Form.StateContext = FormStateContext

/******************************************************************************/
// Exports
/******************************************************************************/

export default Form

export {
  FormStateContext
}
