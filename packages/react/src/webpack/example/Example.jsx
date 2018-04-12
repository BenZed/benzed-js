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

const Stats = (

  ({ stats, path }) =>
    <div>
      <h1>Scores: {stats.scores.length}</h1>
      <h2>Average: {stats.average}</h2>
      <br/>
      {[ 1, 2, 3, 4, 5 ].map(v =>
        <button onClick={() => stats.addScore(v)}>{v}</button>
      )}
    </div>

)::observe({
  stats: []
})

/******************************************************************************/
// Main
/******************************************************************************/

const Example = () =>
  <Page>

    <Header>BenZed React</Header>

    <Stats />

  </Page>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Example
