import React from 'react'
import styled from 'styled-components'

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

/******************************************************************************/
// Main Component
/******************************************************************************/

const Doc = styled(({ doc, ...props }) => {

  const {
    name,
    description
    //, params, returns
  } = doc

  return <div {...props}>
    <Title>
      <h2>{name}</h2>
    </Title>
    <Description description={description} />
  </div>
})`
  margin: 1em;
  display: flex;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Doc
