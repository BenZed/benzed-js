import React from 'react'
import is from 'is-explicit'

import { Title, Table, Section, Label } from '../helper'

/******************************************************************************/
// Helper
/******************************************************************************/

function toTypeComponent (type) {

  return is.array(type)
    ? type.map(toTypeComponent)
    : is.func(type)
      ? <Label key={type.name}>{type.name}</Label>
      : type === '*'
        ? <Label key='any'>any</Label>
        : <Label key={`${type}`}>{`${type}`}</Label>

}

// Ensure at least one cell in the column has a value
function columnValid (column) {

  for (let i = 1; i < column.length; i++) {
    const cell = column[i]
    if (cell != null)
      return true
  }

  return false
}

/******************************************************************************/
// Helpers
/******************************************************************************/

const Args = ({ args }) => {

  const names = [ 'Name' ]
  const types = [ 'Type' ]
  const defaults = [ 'Default' ]
  const descriptions = [ 'Description' ]

  for (const [ name, data ] of Object.entries(args)) {

    const { type, description, default: _default } = data

    names.push(name)
    types.push(
      toTypeComponent(type || null)
    )
    defaults.push(
      _default || null
    )
    descriptions.push(
      description || null
    )
  }

  const data = [
    names, types, defaults, descriptions
  ].filter(columnValid)

  return <Table key='table' title='Arguments' data={data} />
}

const Returns = ({ returns }) => {

  const types = [
    'Type',
    toTypeComponent(returns.type)
  ]

  const descriptions = [
    'Description',
    returns.description || null
  ]

  const data = [
    types, descriptions
  ].filter(columnValid)

  return <Table key='table' title='Returns' data={data} />
}

/******************************************************************************/
// Main Component
/******************************************************************************/

const Function = ({ children, info, ...props }) => [

  <Section key='description'>

    { info && info.name
      ? <Title key='title'>
        {info.name}
        <Label>function</Label>
      </Title>
      : null
    }

    { info && info.args
      ? <Args args={info.args} />
      : null
    }

    { info && info.returns
      ? <Returns returns={info.returns} />
      : null
    }

    { children
      ? <Title.Sub>Description</Title.Sub>
      : null
    }

    { children }

  </Section>

]

/******************************************************************************/
// Exports
/******************************************************************************/

export default Function
