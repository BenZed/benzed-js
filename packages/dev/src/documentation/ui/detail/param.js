import React from 'react'
import styled from 'styled-components'
import Table from './table'

/******************************************************************************/
// Main Components
/******************************************************************************/

const ParamHeader = ({ children }) => {

  return <Table>
    <h2>Params</h2>
    <Table.Row>
      <Table.Cell>Name</Table.Cell>
      <Table.Cell>Type</Table.Cell>
      <Table.Cell>Description</Table.Cell>
    </Table.Row>

    {children}

  </Table>
}

const Param = ({ name, type, children: description }) =>
  <Table.Row>
    <Table.Cell>{name}</Table.Cell>
    <Table.Cell>{type && type.name}</Table.Cell>
    <Table.Cell>
      { description }
    </Table.Cell>
  </Table.Row>

/******************************************************************************/
// Extends
/******************************************************************************/

Param.Header = ParamHeader

/******************************************************************************/
// Exports
/******************************************************************************/

export default Param
