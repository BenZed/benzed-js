import styled from 'styled-components'
import { Flex } from '../layout'

import TableCell from './table-cell'

/******************************************************************************/
// Main Components
/******************************************************************************/

const TableColumn = styled(Flex.Column)`

  ${TableCell}:first-child {
    font-weight: bold;
  }

`

/******************************************************************************/
// Exports
/******************************************************************************/

export default TableColumn
