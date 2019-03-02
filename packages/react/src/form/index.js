import Form from './form'
import FormStateTree from './form-state-tree'
import FormCurrentContext from './context'
import FromSchema from './from-schema'

import * as inputs from './inputs'

import useForm from './use-form'

/******************************************************************************/
// Extend
/******************************************************************************/

Form.StateTree = FormStateTree
Form.CurrentContext = FormCurrentContext
Form.Buttons = inputs.Buttons
Form.String = inputs.String
Form.Values = inputs.Values
Form.Array = inputs.Array
Form.Object = inputs.Object
Form.Boolean = inputs.Boolean
Form.Number = inputs.Number
Form.Schema = FromSchema

/******************************************************************************/
// Export
/******************************************************************************/

export default Form

export {
  Form,
  FormStateTree,
  FormCurrentContext,

  useForm

}
