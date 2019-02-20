import { Forbidden } from '@feathersjs/errors'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import is from 'is-explicit'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope, react/prop-types */

/******************************************************************************/
// Helper
/******************************************************************************/

const getServiceName = (app, service) => {

  for (const name in app.services)
    if (service === app.services[name])
      return name.charAt(name.length - 1) === 's'
        ? name
        : name + 's'

  return 'unknown'
}

/******************************************************************************/
// Setup
/******************************************************************************/

const noPermission = () => false

function hasAttrs (permissions, ctx, original) {

  const attrs = this

  const isView = ctx.isFind || ctx.isGet

  for (const attr of attrs) {
    const value = permissions[attr]
    if (!value || value === 'none')
      continue

    if (isView && value === 'read')
      return true

    if (value === true || value === 'write' || value === 'manage')
      return true
  }

  return false
}

function checkMethodAttrs (permissions, ctx, original) {

  const methods = this
  const { method } = ctx

  return method in methods && methods[method](permissions, ctx, original)

}

const toPermissionFunc = input => {

  if (is.string(input))
    input = [ input ]

  if (is.arrayOf.string(input))
    input = input::hasAttrs

  if (is.plainObject(input)) {
    const methods = {}
    for (const method of [ 'get', 'find', 'patch', 'update', 'create', 'remove' ])
      methods[method] = toPermissionFunc(input[method])

    input = methods::checkMethodAttrs
  }

  return is.func(input)
    ? input
    : noPermission
}

const PermissionFunction = name => <object key='permission'>
  <func
    key={name}
    cast={toPermissionFunc}
    required
  />
</object>

const valiate = PermissionFunction('checker')

/******************************************************************************/
// Exports
/******************************************************************************/

const permissionsCheck = props => {

  const { checker } = valiate(props)

  return declareEntity('hook', {

    name: 'permissions-check',
    types: 'before',
    provider: 'external'

  }, async ctx => {

    const { params, method, app, id, service } = ctx

    const { user } = params
    if (!user)
      throw new Error('must be authenticated to check permissions.')

    // permissions checking is skipped for admins
    if (user.permissions?.admin)
      return

    // Only admins may do anything in bulk
    if (ctx.isMulti) throw new Forbidden(
      `cannot multi ${method} ${getServiceName(app, service)}.`
    )

    const original = ctx.isCreate || ctx.isFind || ctx.isGet
      ? null
      : await service.get(id)

    // TODO checker should be decoupled so it can use a schema-equivalent
    // and work in the browser
    if (!checker(user.permissions, ctx, original))
      throw new Forbidden(
        `cannot ${method} ${getServiceName(app, service)}.`
      )
  })
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default permissionsCheck

export {
  PermissionFunction
}
