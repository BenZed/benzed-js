import React from 'react'
import FormCurrentContext from './context'

/******************************************************************************/
// Logic
/******************************************************************************/

const Form = props => {

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

  return <FormCurrentContext.Provider value={form}>

    <form
      onSubmit={handleSubmit}
      data-error={!!form?.error}
      {...rest}
    >
      {children}
    </form>

  </FormCurrentContext.Provider>

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Form
