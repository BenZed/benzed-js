import React from 'react'
import styled from 'styled-components'

import { observe } from '../../state'

/******************************************************************************/
// Styles
/******************************************************************************/

const Page = styled.div`
  padding: 1em;
`

const Header = styled.h1`
  margin: 0;
`

const Count = (

  ({ counter, path }) =>
    <h1 key='1'>{counter.meta.number}</h1>

)::observe({
  counter: []
})

/******************************************************************************/
// Main
/******************************************************************************/

const Example = () =>
  <Page>

    <Header>BenZed React</Header>

    <Count />

  </Page>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Example
