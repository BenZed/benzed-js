import React from 'react'
import styled from 'styled-components'

import Label from './label'

/******************************************************************************/
// Helper
/******************************************************************************/

const Type = styled(({ type, ...props }) => {

  return <span {...props}>
    {type.names.map(name =>
      <code key={name}>{name}</code>
    )}
  </span>
})`
  code {
    color: ${props => props.theme.type.toString()};
    background-color: ${props => props.theme.type.lighten(0.5).toString()};
    border-radius: 0.25em;
    padding: 0.1em;
    &:not(:last-child) {
      margin-right: 0.25em;
    }
  }
`

const Description = styled.span`
  font-style: italic;
`

const Param = styled(({ param, ...props }) => {

  return <div {...props}>
    {param.name
      ? <Label>{param.name}</Label>
      : null
    }
    <Type type={param.type} />
    {param.description
      ? <Description>{param.description}</Description>
      : null
    }
  </div>
})`

  display: flex;
  flex-direction: row;

  justify-content: flex-start;

  ${Label} {
    flex: 0.125 0.125 4em;
  }

  ${Type} {
    flex: 0.125 0 4em;
  }

  ${Description} {
    margin-left: 0.25em;
    flex: 1 1 100%;
  }

  margin: 0.5em 0em 0em 1em;
`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Params = styled(({ params, label, ...props }) =>
  <div {...props}>
    <Label>{label}</Label>
    {params.map((param, i) => <Param param={param} key={i} />)}
  </div>)`

  margin-top: 0.5em;
  font-size: 0.8em;

  > ${Label} {
    display: inline-flex;
    background-color: ${props => props.theme.primary.toString()};
    padding: 0.25em;
    border-radius: 0.25em;
    color: ${props => props.theme.primary.darken(0.4).toString()};
  }
`

Params.defaultProps = {
  label: 'params'
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Params
