import React from 'react'
import styled from 'styled-components'
import $ from '../../theme'

/******************************************************************************/
// Styled
/******************************************************************************/

const Container = styled.div`
  background-color: ${$.theme.fg};
  color: ${$.theme.bg};
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

const Title = ({ title = 'BenZed', subtitle = 'DOCUMENTATION' }) => [
  <span key='name'>{title} |</span>,
  <span key='doc'>{subtitle}</span>
]

/******************************************************************************/
// Main Component
/******************************************************************************/

const TopBar = ({ title, subtitle, children, ...props }) =>
  <Container {...props}>
    <Title title={title} subtitle={subtitle}/>
    {children}
  </Container>

/******************************************************************************/
// Exports
/******************************************************************************/

export default TopBar
