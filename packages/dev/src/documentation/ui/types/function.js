import React from 'react'
import is from 'is-explicit'

import { Title, Table, Section, Label } from '../helper'
import { createPropTypesFor } from '@benzed/schema'

/******************************************************************************/
// Helper
/******************************************************************************/

const BUILTINS = [
  Set, Array, Map, RegExp, Date, global.Function
]

function toTypeComponent (type) {

  if (is.array(type))
    return type.map(toTypeComponent)

  const isFunc = is.func(type)

  let brand

  const isAny = type === '*' || type === 'any'
  if (isAny)
    type = 'any'
  const name = isFunc ? type.name : `${type}`

  if (type === Boolean || isAny || type == null)
    brand = 'literal'

  else if (type === Number)
    brand = 'type'

  else if (type === String)
    brand = 'string'

  else if (BUILTINS.includes(type))
    brand = 'builtin'

  return <Label key={name} brand={brand}>{name}</Label>
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
// Args
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

Args.propTypes = createPropTypesFor(React => <proptypes>
  <array key='args'>
    <object />
  </array>
</proptypes>)
/******************************************************************************/
// Returns
/******************************************************************************/

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

Returns.propTypes = createPropTypesFor(React =>
  <proptypes>
    <array key='returns'>
      <object />
    </array>
  </proptypes>)

/******************************************************************************/
// Main Component
/******************************************************************************/

const Function = ({ children, info, ...props }) => [

  <Section key='description'>

    { info && info.name
      ? <Title key='title'>
        {info.name}
        <Label brand='keyword'>function</Label>
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
