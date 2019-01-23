import Form from './form'

import String from './string'
import Number from './number'
import Bool from './bool'
import Values from './values'
import Date from './date'

import StateTree from './state-tree'

/******************************************************************************/
// Extend
/******************************************************************************/

Form.String = String
Form.Number = Number
Form.Bool = Form.Boolean = Bool
Form.Values = Values
Form.Date = Date
Form.State = Form.StateTree = StateTree

/******************************************************************************/
// Exports
/******************************************************************************/

export default Form
