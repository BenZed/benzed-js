import React from 'react'
import styled from 'styled-components'

import Page from './page'
import Missing from './missing'

import { Doc } from '../components'
/******************************************************************************/
// Helper
/******************************************************************************/

function groupDocsBy (key, name) {

  const pkg = this

  const groups = {}

  for (const doc of pkg.doc) {
    if (name && doc.name !== name)
      continue

    const value = doc[key] || ''
    groups[value] = groups[value] || { [key]: value, doc: [] }
    groups[value].doc.push(doc)
  }

  return Object.values(groups)

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
  const groups = pkg::groupDocsBy('kind', docName)

  return groups.length > 0
    ? <Page>
      <Header>
        <h1>{pkg.name}</h1>
        <h3>{pkg.description}</h3>
      </Header>
      {groups.map(({ kind, doc }) => [

        isSingleDoc
          ? null
          : <Group key='title'>{kind}s</Group>,

        ...doc.map(doc => <Doc key={doc.name} doc={doc} match={match} />)

      ])}
    </Page>
    : <Missing location={location}/>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Package
