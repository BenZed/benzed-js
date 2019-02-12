import { useContext } from 'react'

import { FormStateContext } from './form'
import { get } from '@benzed/immutable'

/******************************************************************************/
// useFormInput Hook TODO move me
/******************************************************************************/

const useFormInput = path => {

  const form = useContext(FormStateContext)
  const value = path && get.mut(form.current, path)
  const error = path && get.mut(form.error, [ 'errors', ...path ])

  return { form, value, error }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useFormInput
