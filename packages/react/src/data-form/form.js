import React, { createContext } from 'react'

import { Flex } from '../layout'

import { equals } from '@benzed/immutable'

/******************************************************************************/
// Context
/******************************************************************************/

const FormStateContext = createContext()

/******************************************************************************/
// Logic
/******************************************************************************/

class Form extends React.Component {

  state = {
    current: {},
    errors: {},
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

    const { current, history, historyIndex } = form

    const {
      hasChangesToUpstream: canSave,
      canRedoEditCurrent: canRedo,
      canUndoEditCurrent: canUndo,
      pushCurrent,
      editCurrent
    } = form

    const { handleChange, revert, redo, undo } = this

    const revertType = form.upstreamTimestamp > form.currentTimestamp
      ? 'revert' : 'cancel'

    const formDataWithEventHandlers = {
      current,
      errors: {},
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
      undo
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
    const { children, ...props } = this.props

    return <FormStateContext.Provider value={this.state}>
      <Flex as='form' onSubmit={this.handleSubmit} {...props}>
        {children}
      </Flex>
    </FormStateContext.Provider>
  }

}

/******************************************************************************/
// Extend
/******************************************************************************/

Form.StateProvider = FormStateContext.Provider
Form.StateConsumer = FormStateContext.Consumer

/******************************************************************************/
// Exports
/******************************************************************************/

export default Form

export {
  FormStateContext
}
