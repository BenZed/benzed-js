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
    history: [],
    onChange: () => {}
  }

  // Form Event Handlers

  onSubmit = e => {

    e.preventDefault()

    const { form } = this.props

    console.log('SUBMITTING', form.current)

  }

  onChange = e => {

    const { form } = this.props

    const path = (e.target.dataset.path || '').split(',')

    form.editCurrent(path, e.target.value)
  }

  // State Setters

  createFormWithEventHandlers = (form = this.props.form) => {

    const { current, history } = form
    if (equals(current, this.state.current))
      return

    const { onChange } = this

    const formWithEventHandlers = {
      current,
      history,
      onChange
    }

    this.setState(formWithEventHandlers)
  }

  componentDidMount () {
    const { form } = this.props
    if (!form)
      throw new Error('form state is required')

    form.subscribe(this.createFormWithEventHandlers)
    this.createFormWithEventHandlers()
  }

  componentDidUpdate (prev) {

    if (prev.form !== this.props.form) {
      prev.form.unsubscribe(this.createFormWithEventHandlers)
      this.props.form.subscribe(this.createFormWithEventHandlers)
      this.createFormWithEventHandlers()
    }
  }

  render () {
    const { children } = this.props

    return <FormStateContext.Provider value={this.state}>
      <form onSubmit={this.onSubmit}>
        {children}
      </form>
    </FormStateContext.Provider>
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

const Form = styled(FormLogic)`

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
