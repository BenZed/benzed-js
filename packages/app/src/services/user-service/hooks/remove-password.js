import { discard, iff, isProvider } from 'feathers-hooks-common'
import { prepareGeneric } from '../../../hooks/hook'

// TODO this should be moved to src/services/user-services/hooks

/******************************************************************************/
// Data
/******************************************************************************/

const REMOVE_PRIORITY = 100

/******************************************************************************/
// Helper
/******************************************************************************/

const removePassword = iff(
  isProvider('external'),
  discard('password')
)::prepareGeneric('password::remove', REMOVE_PRIORITY)

/******************************************************************************/
// Exports
/******************************************************************************/

export default removePassword
