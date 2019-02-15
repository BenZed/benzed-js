import React from 'react'

import FormCurrentContext from './context'
import FormStateTree from './form-state-tree'

import * as inputs from './inputs'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const createFormPreset = (formComponent, mapOrMapper) => {

  for (const key of Object.keys(Form))
    formComponent[key] = formComponent[key] || Form[key]

  if (is.func(mapOrMapper))
    for (const key in inputs)
      formComponent[key] = mapOrMapper(inputs[key], key, formComponent)

  else {
    for (const key in mapOrMapper)
      formComponent[key] = mapOrMapper[key]

    for (const key in inputs)
      if (key in formComponent === false)
        formComponent[key] = inputs[key]
  }

  return formComponent

}

/******************************************************************************/
// Logic
/******************************************************************************/

function Form (props) {

  const {
    children,
    form,
    onSubmit,
    ...rest
  } = props

  const handleSubmit = async e => {
    e.preventDefault()

    await form.pushUpstream()

    if (onSubmit)
      onSubmit(e)
  }

  const FormComponent = this || 'form'

  return <FormCurrentContext.Provider value={form}>
    <FormComponent onSubmit={handleSubmit} {...rest}>
      {children}
    </FormComponent>
  </FormCurrentContext.Provider>

}

/******************************************************************************/
// Extends
/******************************************************************************/

Form.Context = FormCurrentContext
Form.StateTree = FormStateTree

/******************************************************************************/
// Exports
/******************************************************************************/

export default createFormPreset(Form, inputs)

export {
  createFormPreset
}
