import React from 'react'
import styled from 'styled-components'

import { Flex, GlobalStyle } from '@benzed/react'

import Routes from './routes'
import Navigation from './navigation'
import TopBar from './topbar'

import docDefaultTheme from '../../theme'

import { PropTypeSchema, any, arrayOf, object } from '@benzed/schema'

/******************************************************************************/
// Main Layout
/******************************************************************************/

const Content = styled.div`
  display: inherit;

  flex-direction: row;
  flex-grow: 1;
`

const Body = styled.div`
  flex-grow: 1;
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
