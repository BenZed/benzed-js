import Hook from './hook'
import { AUTH_PRIORITY } from './jwt-auth'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function ensureType (id, Type) {

  const isArray = is.array(id)

  if (isArray)
    for (let i = 0; i < id.length; i++)
      id[i] = ensureType(id[i], Type)
  else if (!is(id, Type))
    id = Type(id)

  if ((isArray && !id.every(Type::is)) || (!isArray && !is(id, Type)))
    throw new Error(
      `query ids could not be converted to ${Type.name}`
    )

  return id
}

/******************************************************************************/
// Main
/******************************************************************************/

function exec (ctx) {

  this.checkContext(ctx)

  const { type: Type } = this.options

  const { params } = ctx

  // Don't need to continue if there is no query
  const query = params && params.query
  if (!query || !is.defined(query._id))
    return

  if (!is.plainObject(query._id))
    query._id = ensureType(query._id, Type)

  else if (is.array(query._id.$in))
    query._id.$in = ensureType(query._id.$in, Type)

  return ctx
}

function setup (type = String) {

  return { type }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default new Hook({

  name: 'cast-query-ids',
  exec,
  setup,
  priority: AUTH_PRIORITY + 25,
  types: 'before'

})
