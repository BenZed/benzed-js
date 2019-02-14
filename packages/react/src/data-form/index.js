import Form from './form'

import Input from './input'

import FormString from './string'
import FormNumber from './number'
import FormBool from './bool'
import FormValues from './values'
import FormDate from './date'
import FormButtons from './buttons'

import FormStateTree from './form-state-tree'

import useFormInput from './use-form-input'

/******************************************************************************/
// Extend
/******************************************************************************/

Form.Input = Input

Form.String = FormString
Form.Number = FormNumber
Form.Bool = Form.Boolean = FormBool
Form.Values = FormValues
Form.Date = FormDate
Form.Buttons = FormButtons
Form.State = Form.StateTree = FormStateTree

/******************************************************************************/
// Exports
/******************************************************************************/

export default Form

export {
  Form,
  FormString,
  FormNumber,
  FormBool,
  FormValues,
  FormDate,
  FormStateTree,

  useFormInput
}
