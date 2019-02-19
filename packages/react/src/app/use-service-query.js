import { useEffect, useState } from 'react'

import { equals } from '@benzed/immutable'

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
      setQuery(query)

  }

  useEffect(() => {

    const updateRecords = () =>
      setRecords(result.ids.map(service.get))

    service.subscribe(updateRecords, ['records'], ['forms'])

    return () => service.unsubscribe(updateRecords)

  }, [ service, ...result.ids ])

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
