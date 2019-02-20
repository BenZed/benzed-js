import { NotFound } from '@feathersjs/errors'

import declareEntity from '../declare-entity'

import { set } from '@benzed/immutable'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const NOT_DELETED = { $in: [ false, null, undefined ] }

/******************************************************************************/
// Helper
/******************************************************************************/

function sortParams (params, { allowClientDisable, disableParam }) {
  params.query = params.query || {}

  if (disableParam in params.query && (allowClientDisable || !params.provider))
    params[disableParam] = params.query[disableParam]

  delete params.query[disableParam]

  return params
}

async function throwIfDeleted (hook, { field, disableParam }) {

  const { service, id, method, app, params } = hook

  const auth = app.get('auth')
  const entity = (auth && auth.entity) || 'user'
  const { provider, authenticated } = params

  const getParams = Object.assign(
    {},
    method === 'get'
      ? params
      : {
        query: {},
        provider,
        authenticated,
        _populate: 'skip',
        [entity]: params[entity]
      },
    { [disableParam]: true }
  )

  const doc = await service.get(id, getParams)
  if (doc[field])
    throw new NotFound(`Record for id '${id}' has been soft deleted.`)

  return doc
}

const validate = <object plain>
  <string key='field' default='deleted'/>
  <string key='disableParam' default='$disableSoftDelete'/>
  <bool key='allowClientDisable' default={false} />
  <func key='setDeleted' default={() => new Date()} />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const softDelete = props => {

  const options = validate(props)

  return declareEntity('hook', {
    name: 'soft-delete',
    types: 'before',
    provider: 'external'
  }, async ctx => {

    const { method, service, params } = ctx
    const { disableParam, setDeleted, field } = options

    ctx.params = sortParams(params)

    if (ctx.params[disableParam])
      return ctx

    switch (method) {
      case 'find':
        ctx.params.query[field] = NOT_DELETED
        break

      case 'get':
        ctx.result = await throwIfDeleted(ctx, options)
        break

      // fall through
      case 'update':
      case 'patch':
        if (ctx.id !== null)
          await throwIfDeleted(ctx, options)

        ctx.params.query[field] = NOT_DELETED
        break

      case 'remove':
        if (ctx.id)
          await throwIfDeleted(ctx, options)

        ctx.data = ctx.data || {}
        ctx.data[field] = await setDeleted(ctx)
        if (!ctx.data[field])
          throw new Error('config.setDeleted must return a truthy value.')

        ctx.params.query[field] = NOT_DELETED

        ctx.result = await service.patch(
          ctx.id,
          ctx.data,
          set(ctx.params, disableParam, true)
        )
        break

      case 'create':
      // No soft deleting needs to happen on create
        break
    }

    return ctx
  })
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default softDelete
