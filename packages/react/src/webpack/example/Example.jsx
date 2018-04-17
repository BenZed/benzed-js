import React from 'react'
import styled from 'styled-components'

import { sort } from '@benzed/immutable'

/******************************************************************************/
// Styles
/******************************************************************************/

const Page = styled.div`
  padding: 1em;
`

const Header = styled.h1`
  margin: 0;
`

const Stats = ({ arr }) => {

  return <div>
    {
      arr
        ::sort()
        .map(num => <h1 key={num}>{num}</h1>)
    }
  </div>
}

/******************************************************************************/
// Main
/******************************************************************************/

const Example = ({ arr }) =>
  <Page>

    <Header>BenZed React</Header>

    <Stats arr={arr}/>

  </Page>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Example
