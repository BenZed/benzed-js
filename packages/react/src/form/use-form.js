import FormCurrentContext from './context'
import { useContext } from 'react'
import { useStateTree } from '../util'

import { wrap } from '@benzed/array'

/******************************************************************************/
// Hooks
/******************************************************************************/

const useForm = () => useContext(FormCurrentContext)

const useFormValueAtPath = (form, path) => {

  const valuePath = [ 'current', ...wrap(path) ]
  const value = useStateTree.path(form, valuePath)

  return value
}

const useFormErrorAtPath = (form, path) => {

  const errorPath = [ 'error', 'errors', ...wrap(path) ]
  const error = useStateTree.path(form, errorPath)

  return error
}

/******************************************************************************/
// Extend
/******************************************************************************/

useForm.context = useForm
useForm.observe = useStateTree.observe
useForm.valueAtPath = useFormValueAtPath
useForm.errorAtPath = useFormErrorAtPath

/******************************************************************************/
// Exports
/******************************************************************************/

export default useForm
