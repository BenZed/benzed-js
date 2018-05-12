import Hook from './hook'

import { AUTH_PRIORITY } from './jwt-auth'
import { Schema, func, required } from '@benzed/schema'

/******************************************************************************/
// Main
/******************************************************************************/

const softDelete = new Hook({

  name: 'soft-delete',
  priority: AUTH_PRIORITY + 1,
  methods: 'all',
  types: 'before',

  setup: new Schema({
    setDeletedValue: func()
  }),

  exec: function (ctx) {
    const hook = this
    hook.checkContext(ctx)
    console.log(hook.name, 'is not yet implemented')
  }
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default softDelete
