import React, { createElement, cloneElement, Children } from 'react'

import ServiceStateTree from '../state-tree/service-state-tree'

import { createPropTypesFor } from '@benzed/schema' // eslint-disable-line no-unused-vars
import { until } from '@benzed/async'
import { max } from '@benzed/math'

import is from 'is-explicit'

/******************************************************************************/
//
/******************************************************************************/

const ServiceTable = props => 'ServiceTable component not yet implemented'

/******************************************************************************/
// Main Component
/******************************************************************************/

class ServiceView extends React.Component {

  propTypes = createPropTypesFor(React =>
    <proptypes>
      <ServiceStateTree key='tree' required />
      <object key='query' />
      <any key='children' required />
    </proptypes>
  )

  state = {
    ids: [],
    records: [],

    limit: 0,
    maxLimit: 0,

    skip: 0,
    total: undefined,
    fetching: false
  }

  fetch = async (query = { }) => {

    const { tree } = this.props

    const { client } = tree.config
    if (client && !client.host)
      await until(() => client.host)

    this.setState({ fetching: true })

    const { data, ...stats } = await tree.find(query)

    const ids = data.map(r => r._id)

    this.setState({
      ids,
      fetching: false,
      ...stats,
      maxLimit: max(this.state.maxLimit, stats.limit)
    })

    this.updateRecords(tree)
  }

  updateRecords = tree => {

    const { ids } = this.state

    const records = ids.map(tree.get)

    this.setState({ records })
  }

  componentDidMount () {

    const { tree } = this.props

    if (!ServiceView.warned) {
      ServiceView.warned = true
      console.warn('stop using ServiceView. Favour useServiceQuery hook instead.')
    }

    tree.subscribe(this.updateRecords, 'records', 'forms')
  }

  componentWillUnmount () {
    const { tree } = this.props

    tree.unsubscribe(this.updateRecords)
  }

  render () {

    const {
      children = ServiceTable,
      tree,
      query,
      ...props
    } = this.props

    const { fetch } = this

    const Component = children

    const view = {
      ...props,
      ...this.state,
      fetch,
      tree,
      serviceName: tree?.config?.serviceName
    }

    return is.func(Component)
      ? createElement(Component, view)
      : cloneElement(Children.only(Component), view)
  }

}

/******************************************************************************/
// EXtend
/******************************************************************************/

ServiceView.Table = ServiceTable

/******************************************************************************/
// Exports
/******************************************************************************/

export default ServiceView
