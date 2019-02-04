import React, { createContext } from 'react'

import { equals } from '@benzed/immutable'
import { Flex } from '../layout'

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

  onSubmit = async e => {

    e.preventDefault()

    const { form } = this.props

    await form.pushUpstream()

  }

  onChange = e => {

    const { form } = this.props

    const path = (e.target.dataset.path || '').split(',')

    if (path && path.length > 0) {
      form.editCurrent(path, e.target.value)
      form.pushCurrent()
    } else
      throw new Error('path not specified in event.target.dataset')
  }

  // State Setters

  createFormWithEventHandlers = (form = this.props.form) => {

    const { current, history, historyIndex } = form
    if (equals(current, this.state.current))
      return

    const {
      hasChangesToCurrent,
      revertCurrentToOriginal,

      hasChangesToUpstream,
      revertToUpstream,

      hasUnpushedHistory,

      canRedoEditCurrent,
      redoEditCurrent,

      canUndoEditCurrent,
      undoEditCurrent
    } = form

    const { onChange } = this

    const formDataWithEventHandlers = {
      current,
      errors: {},
      history,
      historyIndex,

      onChange,

      hasChangesToCurrent,
      revertCurrentToOriginal,

      hasChangesToUpstream,
      revertToUpstream,

      hasUnpushedHistory,
      canRedoEditCurrent,
      redoEditCurrent,

      canUndoEditCurrent,
      undoEditCurrent
    }

    console.log(formDataWithEventHandlers)

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
      <Flex as='form' onSubmit={this.onSubmit} {...props}>
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
