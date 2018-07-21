import React from 'react'
import styled from 'styled-components'

import Page from './page'
import Missing from './missing'

import { Doc } from '../components'
import { PropTypeSchema, object, required } from '@benzed/schema'
import { fromQueryString } from '@benzed/string'
import { Scroll } from '@benzed/react'

/******************************************************************************/
// Helper
/******************************************************************************/

function groupDocsBy (key) {

  const pkg = this

  const groups = {}

  for (const doc of pkg.doc) {
    const value = doc[key] || ''
    groups[value] = groups[value] || { [key]: value, doc: [] }
    groups[value].doc.push(doc)
  }

  return Object.values(groups)
}

function getDocsNamed (name) {

  const pkg = this
  return pkg.doc.filter(doc => doc.name === name)
}

/******************************************************************************/
// Styled Components
/******************************************************************************/

const Header = styled.div`
  text-transform: capitalize;

  background-color: ${props => props.theme.primary.fade(0.5).toString()};
  color: ${props => props.theme.primary.darken(0.5).toString()};

  padding: 1em;
  h3 {
    margin-top: 0.5em;
  }
`

const Group = styled.h2`
  text-transform: capitalize;
  margin: 0.5em;

  color: ${props => props.theme.primary.darken(0.5).toString()};
`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Package = ({ children, pkg, match, location, ...props }) => {

  const { docName } = match.params

  const isSingleDoc = !!docName
  const key = isSingleDoc
    ? null
    : fromQueryString(location.search).group || 'kind'

  const data = isSingleDoc
    ? pkg::getDocsNamed(docName)
    : pkg::groupDocsBy(key)

  return data.length > 0
    ? <Page>
      <Header>
        <h1>{pkg.name}</h1>
        <h3>{pkg.description}</h3>
      </Header>
      <Scroll y>
        { isSingleDoc

          ? <Doc doc={data[0]} />

          : data.map(({ [key]: header, doc }) => [

            header
              ? <Group key='title'>{header}s</Group>
              : null,

            ...doc.map(doc => <Doc key={doc.name} doc={doc} />)
          ])}
      </Scroll>
    </Page>
    : <Missing location={location}/>
}

/******************************************************************************/
// PropTypes
/******************************************************************************/

Package.propTypes = new PropTypeSchema({
  pkg: object(required),
  match: object(required),
  location: object(required)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default Package
