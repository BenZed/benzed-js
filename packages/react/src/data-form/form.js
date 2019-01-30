import React, { createContext } from 'react'
import styled from 'styled-components'

import { equals } from '@benzed/immutable'

/******************************************************************************/
// Context
/******************************************************************************/

const FormStateContext = createContext()

/******************************************************************************/
// Logic
/******************************************************************************/

class FormLogic extends React.Component {

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

    if (path && path.length > 0)
      form.editCurrent(path, e.target.value)
    else
      throw new Error('path not specified in event.target.dataset')
  }

  // State Setters

  createFormWithEventHandlers = (form = this.props.form) => {

    const { current, history } = form
    if (equals(current, this.state.current))
      return

    const { onChange } = this

    const formDataWithEventHandlers = {
      current,
      errors: {},
      history,
      onChange
    }

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
    const { children, className, style } = this.props

    return <FormStateContext.Provider value={this.state}>
      <form onSubmit={this.onSubmit} className={className} style={style}>
        {children}
      </form>
    </FormStateContext.Provider>
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

const Form = styled(FormLogic)`
  flex-grow: 1;
`

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
