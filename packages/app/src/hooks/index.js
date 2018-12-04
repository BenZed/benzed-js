import softDelete from './soft-delete'
import writeDateFields from './dates-write'

import passwordValidate from './password-validate'
import schemaValidate from './schema-validate'

import permissionsCheck from './permissions-check'
import permissionsFilter from './permissions-filter'

import QuickHook from './util/quick-hook'

/******************************************************************************/
// Exports
/******************************************************************************/

export default QuickHook

export {

  softDelete,
  writeDateFields,

  schemaValidate,
  passwordValidate,

  permissionsCheck,
  permissionsFilter

}
