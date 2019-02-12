import { useContext } from 'react'

import { FormStateContext } from './form'
import { get } from '@benzed/immutable'

/******************************************************************************/
// useFormInput Hook TODO move me
/******************************************************************************/

const useFormInput = path => {

  const form = useContext(FormStateContext)
  const value = get.mut(form.current, path)

  return { form, value }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useFormInput
