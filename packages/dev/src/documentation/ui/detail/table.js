import React from 'react'
import styled from 'styled-components'

/******************************************************************************/
// Sub Components
/******************************************************************************/

const TableLayout = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
`

const TableRow = styled.li`
  display: flex;
  flex-direction: row;

  margin: 0;
  padding: 0;

  list-style-type: none;
`

const TableCell = styled.span`
  flex: 1 1 auto;
`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Table = ({ children, ...props }) =>
  <TableLayout {...props}>
    { children }
  </TableLayout>

/******************************************************************************/
// Extends
/******************************************************************************/

Table.Row = TableRow
Table.Cell = TableCell

/******************************************************************************/
// Exports
/******************************************************************************/

export default Table
