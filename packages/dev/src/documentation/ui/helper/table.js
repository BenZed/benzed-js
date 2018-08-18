import React from 'react'
import styled from 'styled-components'
import { SubTitle } from './title'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const TableCell = styled.div`
  padding: 0.25em 0.5em 0.25em 0.5em;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  flex: 0 0 1.75em;

  > :not(:last-child) {
    margin-right: 0.25em;
  }

  &:not(:first-child) {
    background-color: ${props =>
    props.striped
      ? props.theme.brand.primary.fade(0.9).toString()
      : props.theme.brand.primary.fade(0.75).toString()};
  }
`

const TableColumn = styled.div`
  display: flex;
  flex-direction: column;

  > ${TableCell}:first-child {
    font-weight: bold;
    color: ${props => props
    .theme
    .brand
    .primary
    .darken(0.25)
    .toString()};
  }
`

const TableLayout = styled.div`
  display: flex;
  flex-direction: row;

  flex-grow: 1;
  align-items: stretch;

  > ${TableColumn}:last-child {
    flex-grow: 1;
  }

  margin: 0em 0em 1em 0em;
`

/******************************************************************************/
// Helper
/******************************************************************************/

function dataToColumns (data) {

  return data.map((column, i) =>
    <TableColumn key={i}>
      {
        column.map((cell, j) =>
          <TableCell key={j} striped={j % 2 === 0}>{cell}</TableCell>
        )
      }
    </TableColumn>
  )
}

/******************************************************************************/
// Main Component
/******************************************************************************/

const Table = ({ children, data, title, ...props }) => {

  const columns = data
    ? dataToColumns(data)
    : children

  return [

    title
      ? <SubTitle key='title'>{title}</SubTitle>
      : null,

    <TableLayout key='layout' {...props}>
      { columns }
    </TableLayout>

  ]
}

/******************************************************************************/
// Extends
/******************************************************************************/

Table.Column = TableColumn
Table.Cell = TableCell

/******************************************************************************/
// Exports
/******************************************************************************/

export default Table
