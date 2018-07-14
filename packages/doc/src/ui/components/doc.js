import React from 'react'
import styled from 'styled-components'

import Label from './label'
import Params from './params'

import { Link } from 'react-router-dom'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const Title = styled.div`

  display: flex;
  flex-direction: row;

  background-color: ${props => props.theme.primary.fade(0.5).toString()};
  color: ${props => props.theme.primary.darken(0.5).toString()};

  margin: 0em -1em 0em -1em;

  padding: 0.25em 0.25em 0.25em 1.25em;
`

const Description = styled.div.attrs({
  children: props => props
    .description
    .split('\n\n')
    .map((paragraph, i) =>
      <p key={i}>{paragraph}</p>
    )
})`
  padding: 0.5em 0em 0.5em 0em;
  p {
    margin: 0em 0em 0.25em 0em;
  }
`

const LinkLabel = Label.withComponent(Link)

/******************************************************************************/
// Main Component
/******************************************************************************/

const Doc = styled(({ doc, match, ...props }) => {

  const { name, description, params, returns } = doc

  return <div {...props}>
    <Title>
      <LinkLabel to={`${match.url}/${name}`}>{name}</LinkLabel>
    </Title>
    <Description description={description} />
    <Params params={params} />
    <Params params={returns} label='returns' />
  </div>
})`
  margin: 1em;
  display: flex;

  ${LinkLabel} {
    text-decoration: none;
  }
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Doc
