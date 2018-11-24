import React from 'react'
import styled from 'styled-components'

import { createPropTypesFor } from '@benzed/schema'
import { until } from '@benzed/async'
import { get, set, push } from '@benzed/immutable'

import Routes from './routes'
import Navigation from './navigation'
import TopBar from './topbar'
import Search from './search'

/******************************************************************************/
// Main Layout
/******************************************************************************/

const Content = styled.div`
  display: inherit;

  flex-direction: row;
  flex-grow: 1;

  max-height: calc(100vh - 4em);
`

const Body = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  max-width: calc(100% - 15em);
`

/******************************************************************************/
// Helper
/******************************************************************************/

const navTreeObjToArr = obj => {

  const tree = []

  for (const key in obj) {
    const {
      _: records = [],
      ...child
    } = obj[key]

    const nodes = records.map(record => Object({ name: record.name }))

    let [ parent ] = nodes.filter(record => record.name === key)
    if (!parent)
      parent = { name: key, children: [] }

    parent.children = nodes.filter(record => record !== parent)

    if (Object.keys(child).length > 0)
      parent.children.push(...navTreeObjToArr(child))

    tree.push(parent)
  }

  return tree
}

const buildNavTree = (records) => {

  const navTreeObj = records
    .reduce((t, record) => {
      const value = t::get.mut(record.path) || {}
      return t::set.mut(record.path, value)
    }, {})

  return navTreeObjToArr(navTreeObj)
}

/******************************************************************************/
// Main
/******************************************************************************/

class DocView extends React.Component {

  state = {
    docs: [],
    nav: []
  }

  componentDidMount () {
    const { docs } = this.props
    docs.subscribe(this.update)
    this.fetch()
  }

  componentWillUnmount () {
    const { docs } = this.props
    docs.unsubscribe(this.update)
  }

  async fetch () {
    const { docs } = this.props
    const { client } = docs.config

    await until(() => client.host)

    return docs.find({})
  }

  update = state => {

    const { count, ...records } = state.records

    const docs = Object.values(records)

    const nav = buildNavTree(docs)

    this.setState({ nav, docs })

  }

  render () {

    const { children, title, subtitle } = this.props
    const topbar = !children && { title, subtitle }

    const { nav, docs } = this.state

    return <React.Fragment>

      {
        children || <TopBar {...topbar} />
      }

      <Content>

        <Navigation nodes={nav} />
        <Body>
          { children }
          <Routes docs={docs} />
        </Body>

      </Content>

    </React.Fragment>
  }

}

/******************************************************************************/
// Prop Types
/******************************************************************************/

DocView.propTypes = createPropTypesFor(React => <proptypes>
  <any key='children' />
  <object key='client' required />
  <array key='packages'>
    <object required />
  </array>
</proptypes>)

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocView
