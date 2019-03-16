import { useEffect, useState } from 'react'

import { $$feathers } from './state-tree/service-state-tree'

import { splice } from '@benzed/immutable'

/******************************************************************************/
// Helper
/******************************************************************************/

const toId = record => record._id

const fakeEmptyResult = e => {

  console.error(e)

  return {
    data: [],
    limit: 0,
    skip: 0,
    total: 0
  }
}

const getFeathersService = ({ config }) =>
  config.client[$$feathers]
    .service(config.serviceName)

const hash = query => require('util').inspect(query)

const combine = (a, b) => {

  const c = { ...a, ...b }
  for (const key in c)
    if (c[key] === null)
      delete c[key]

  return c
}
/******************************************************************************/
// Main
/******************************************************************************/

const useServiceQuery = (service, inputQuery) => {

  const [ querying, setQuerying ] = useState(false)
  const [ query, setQuery ] = useState(inputQuery)
  const [ queryResult, setQueryResult ] = useState({
    ids: [],
    limit: 0,
    maxLimit: 0,
    skip: 0,
    total: 0
  })

  const applyQuery = async (_query = query) => {

    setQuerying(true)

    _query = combine(
      _query,
      {
        $limit: Number.MAX_SAFE_INTEGER
      })

    const { data, limit, ...stats } = await service
      .find(_query)
      .catch(fakeEmptyResult)

    const ids = data.map(toId)

    const maxLimit = limit > queryResult.maxLimit
      ? limit
      : queryResult.maxLimit

    setQueryResult({
      ...stats,
      maxLimit,
      ids
    })

    setQuerying(false)

    if (_query !== query)
      setQuery(_query)

  }

  const queryHash = hash(query)
  // ensure query results are synced with creations
  useEffect(() => {

    const removed = data => {
      const index = queryResult.ids.indexOf(data._id)
      if (index >= 0) {

        const { total, ids, ...rest } = queryResult

        setQueryResult({
          ...rest,
          total: total - 1,
          ids: ids::splice(index, 1)
        })
      }
    }

    const feathers = getFeathersService(service)
    feathers.on('created', applyQuery)
    feathers.on('removed', removed)

    return () => {
      feathers.off('created', applyQuery)
      feathers.off('removed', removed)
    }

  }, [ queryHash, queryResult.ids.join(',') ])

  useEffect(() => {
    applyQuery(combine(query, inputQuery))
  }, [ hash(inputQuery) ])

  return [ queryResult, applyQuery, querying ]

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useServiceQuery
