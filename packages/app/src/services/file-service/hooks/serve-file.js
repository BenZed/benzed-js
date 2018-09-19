import is from 'is-explicit'

import { Schema, string, length, trim } from '@benzed/schema'
import { wrap, unwrap } from '@benzed/array'
import { BadRequest } from '@feathersjs/errors'

import Hook from '../../../hooks/hook'

import { AUTH_PRIORITY } from '../../../hooks/jwt-auth'

// TODO this should be moved to src/services/user-services/hooks

/******************************************************************************/
// Data
/******************************************************************************/

export const DEFAULT_LENGTH = 8

/******************************************************************************/
// Exec
/******************************************************************************/

function exec (ctx) {

  const hook = this

  const attr = hook.checkContext(ctx)

  const { provider } = ctx.params
  if (provider !== 'rest')
    return

  console.log(ctx.params, attr)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default new Hook({
  name: 'serve-file',
  types: 'before',
  methods: 'get',
  priority: AUTH_PRIORITY - 100,

  exec
})
