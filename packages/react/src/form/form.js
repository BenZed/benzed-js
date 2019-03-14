import React from 'react'
import FormCurrentContext from './context'
import is from 'is-explicit'

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

    const result = await form.pushUpstream().catch(e => e)
    if (is(result, Error))
      form.setError(result)

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
