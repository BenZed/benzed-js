import React from 'react'
import { createPropTypesFor } from '@benzed/schema' // eslint-disable-line no-unused-vars
import { until } from '@benzed/async'
import { first } from '@benzed/array'
import { get } from '@benzed/immutable'
import { capitalize } from '@benzed/string'

import { Table } from '../../data-view'

/******************************************************************************/
// Helper
/******************************************************************************/

const ServiceTable = props => {

  const { records } = props

  const columns = Object
    .keys(first(records) || {})
    .filter(key => key !== '_id' && key !== 'status')

  return <Table>

    {columns.map(column =>
      <Table.Column key={column}>

        <Table.Cell>
          <strong>{capitalize(column)}</strong>
        </Table.Cell>

        {records.map(record =>
          <Table.Cell key={record._id}>
            {String(get.mut(record, [column]))}
          </Table.Cell>
        )}

      </Table.Column>
    )}

  </Table>
}

/******************************************************************************/
// Main Component
/******************************************************************************/

class ServiceView extends React.Component {

  propTypes = createPropTypesFor(React =>
    <proptypes>
      <function key='tree' required />
      <object key='query' />
    </proptypes>
  )

  state = {
    ids: [],
    records: [],
    limit: 0,
    skip: 0,
    total: 0,
    fetching: false
  }

  async fetch () {
    const { tree, query = {} } = this.props

    const { client } = tree.config
    if (client && !client.host)
      await until(() => client.host)

    console.log(query)

    this.setState({ fetching: true })

    const { data, ...stats } = await tree.find(query)
    const ids = data.map(r => r._id)

    this.setState({ ids, fetching: false, ...stats })
    this.updateRecords(tree)
  }

  updateRecords = tree => {

    const { ids } = this.state
    const records = ids.map(tree.get)

    this.setState({ records })
  }

  componentDidMount () {

    const { tree } = this.props

    tree.subscribe(this.updateRecords, [ 'records' ])
    this.fetch()
  }

  componentWillUnmount () {
    const { tree } = this.props

    tree.unsubscribe(this.updateRecords)
  }

  render () {

    const {
      ViewComponent = ServiceTable,
      tree,
      query,
      ...props
    } = this.props

    return <ViewComponent {...props} {...this.state} />
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ServiceView
