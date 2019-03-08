import { useEffect, useRef, useState } from 'react'

import { equals, copy } from '@benzed/immutable'

import { $$feathers } from './state-tree/service-state-tree'

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
    skip: 0,
    total: 0
  })

  const fetch = async (_query = query) => {

    setFetching(true)

    const { data, ...result } = await service
      .find(_query)
      .catch(fakeEmptyResult)

    const ids = data.map(toId)

    setResult({ ...result, ids })
    setRecords(ids.map(service.get))
    setFetching(false)

    if (!equals(_query, query))
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

  // ensure query results are synced with creations and removals
  useEffect(() => {

    const created = data => {
      if (!result.ids.includes(data._id))
        fetch(query)
    }

    const removed = data => {
      if (result.ids.includes(data._id))
        fetch(query)
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
