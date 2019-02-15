import FormCurrentContext from './context'
import { useContext } from 'react'
import { useStateTree } from '../state-tree-observer'

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

const useFormContextAtPath = path => {

  const form = useForm()
  const error = path && useFormErrorAtPath(form, path)
  const value = path && useFormValueAtPath(form, path)

  return { form, value, error }

}

/******************************************************************************/
// Extend
/******************************************************************************/

useForm.context = useForm
useForm.contextAtPath = useFormContextAtPath
useForm.valueAtPath = useFormValueAtPath
useForm.errorAtPath = useFormErrorAtPath

/******************************************************************************/
// Exports
/******************************************************************************/

export default useForm
