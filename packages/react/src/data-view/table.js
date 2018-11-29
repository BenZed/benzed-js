import styled from 'styled-components'

import TableColumn from './table-column'
import TableCell from './table-cell'
import Virtual from './virtual'

/******************************************************************************/
// Main Components
/******************************************************************************/

const Table = styled(Virtual)`
  overflow-y: scroll;
  position: relative;
`

/******************************************************************************/
// Extends
/******************************************************************************/

Table.Column = TableColumn

Table.Cell = TableCell

/******************************************************************************/
// Exports
/******************************************************************************/

export default Table
