import React from 'react'
import styled from 'styled-components'

import { GlobalStyle } from '@benzed/react'

import Routes from './routes'
import Navigation from './navigation'
import TopBar from './topbar'

import { theme as docDefaultTheme } from '../../theme'

import { PropTypeSchema, any, arrayOf, object } from '@benzed/schema'

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
// Main
/******************************************************************************/

const DocumentationWebsite = ({ theme, title, subtitle, children, docs }) =>

  <GlobalStyle theme={theme || docDefaultTheme}>

    <TopBar title={title} subtitle={subtitle} />
    <Content>

      <Navigation docs={docs} />
      <Body>
        { children }
        <Routes docs={docs} />
      </Body>

    </Content>

  </GlobalStyle>

/******************************************************************************/
// Prop Types
/******************************************************************************/

DocumentationWebsite.propTypes = new PropTypeSchema({
  children: any,
  packages: arrayOf(object)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocumentationWebsite
