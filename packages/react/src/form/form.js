import React from 'react'

import FormCurrentContext from './context'
import * as inputs from './inputs'

/******************************************************************************/
// Thing
/******************************************************************************/

const COMPONENT_MAP = {
  ...inputs
}

const createPreset = inputComponentMap => {

  const FormPreset = Form.bind(inputComponentMap.Form || 'form')

  for (const key in Form)
    if (key in inputComponentMap === false)
      FormPreset[key] = Form[key]

  for (const key in inputComponentMap)
    FormPreset[key] = inputComponentMap[key]

  FormPreset.inputMap = { ...inputs, ...inputComponentMap }

  return FormPreset
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
      {/* <button type='submit'>
        Save
      </button> */}
    </FormComponent>
  </FormCurrentContext.Provider>

}

/******************************************************************************/
// Extend
/******************************************************************************/

Form.Context = FormCurrentContext
Form.createPreset = createPreset
Form.inputMap = inputs

/******************************************************************************/
// Exports
/******************************************************************************/

export default Form.createPreset(COMPONENT_MAP)
