import softDelete from './soft-delete'
import writeDateFields from './write-date-fields'

import validatePassword from './validate-password'
import validateSchema from './validate-schema'

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

  validateSchema,
  validatePassword,

  permissionsCheck,
  permissionsFilter

}
