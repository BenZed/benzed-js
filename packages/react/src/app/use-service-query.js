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

const hash = query => Object
  .entries(query)
  .toString()

/******************************************************************************/
// Main
/******************************************************************************/

const useServiceQuery = service => {

  const [ fetching, setFetching ] = useState(false)
  const [ query, setQuery ] = useState({})
  const [ records, setRecords ] = useState([])
  const [ result, setResult ] = useState({
    ids: [],
    limit: 0,
    maxLimit: 0,
    skip: 0,
    total: 0
  })

  const fetch = async (_query = query) => {

    setFetching(true)

    const { data, limit, ...stats } = await service
      .find(_query)
      .catch(fakeEmptyResult)

    const ids = data.map(toId)

    const maxLimit = limit > result.maxLimit ? limit : result.maxLimit

    setResult({
      ...stats,
      maxLimit,
      ids
    })
    setRecords(ids.map(service.get))
    setFetching(false)
    setQuery(_query)

  }

  // ensure query results are synced with patches
  useEffect(() => {

    const updateRecords = () =>
      setRecords(result.ids.map(service.get))

    service.subscribe(updateRecords, ['records'], ['forms'])

    return () => {
      service.unsubscribe(updateRecords)

    }

  }, [ service, result.ids ])

  // ensure query results are synced with creations
  useEffect(() => {

    const created = data => {
      if (!result.ids.includes(data._id))
        fetch(query)
    }

    const removed = data => {
      const index = result.ids.indexOf(data._id)
      if (index >= 0) {

        const { total, ids, ...rest } = result

        setResult({
          ...rest,
          total: total - 1,
          ids: ids::splice(index, 1)
        })
      }
    }

    const feathers = getFeathersService(service)
    feathers.on('created', created)
    feathers.on('removed', removed)

    return () => {
      feathers.off('created', created)
      feathers.off('removed', removed)
    }

  }, [ hash(query), result.ids ])

  return {
    fetching,
    fetch,
    records,
    result
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useServiceQuery
