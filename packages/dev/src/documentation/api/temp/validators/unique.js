import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

const unique = async (value, ctx) => {

  if (!is.defined(value))
    return value

  const { path, data: hook } = ctx
  const { service, method } = hook

  const key = path[path.length - 1]

  const { total } = await service
    .find({
      query: {
        [key]: value,
        $limit: 1,
        $select: [ '_id', key ]
      }
    })

  const limit = method === 'create'
    ? 0 : 1

  if (total > limit)
    throw new Error('must be unique.')

  return value
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default unique
