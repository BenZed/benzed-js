import FormCurrentContext from './context'
import { useContext } from 'react'
import { useStateTree } from '../state-tree-observer'

import { wrap } from '@benzed/array'
/******************************************************************************/
// Hooks
/******************************************************************************/

const useFormContext = () => useContext(FormCurrentContext)

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

const useForm = path => {

  const form = useFormContext()
  const error = path && useFormErrorAtPath(form, path)
  const value = path && useFormValueAtPath(form, path)

  return { form, value, error }

}

/******************************************************************************/
// Extend
/******************************************************************************/

useForm.context = useFormContext
useForm.valueAtPath = useFormValueAtPath
useForm.errorAtPath = useFormErrorAtPath

/******************************************************************************/
// Exports
/******************************************************************************/

export default useForm
