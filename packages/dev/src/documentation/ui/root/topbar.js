import React from 'react'
import styled from 'styled-components'

/******************************************************************************/
// Styled
/******************************************************************************/

const Container = styled.div`
  background-color: ${props => props.theme.fg.toString()};
  color: ${props => props.theme.bg.toString()};
  padding: 0.685em;
  font-size: 1.5em;

  display: flex;
  flex-direction: row;
  align-items: baseline;

  span:nth-child(2) {
    font-size: 0.7em;
    margin-left: 0.3em;
  }

`

const Search = styled.input.attrs({
  placeholder: 'search'
})`
  margin-left: auto;
  font-size: 0.75em;
`

const Title = () => [
  <span key='name'>BenZed |</span>,
  <span key='doc'>DOCUMENTATION</span>
]

/******************************************************************************/
// Main Component
/******************************************************************************/

const TopBar = ({ ...props }) =>
  <Container {...props}>
    <Title/>
    <Search/>
  </Container>

/******************************************************************************/
// Exports
/******************************************************************************/

export default TopBar
