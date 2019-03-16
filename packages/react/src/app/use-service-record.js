import { first, wrap } from '@benzed/array'
import { useStateTree } from '../util/hooks'

/******************************************************************************/
// Helper
/******************************************************************************/

const getRecordsSymbol = service =>
  getRecordsSymbol.$$ ||
    (getRecordsSymbol.$$ = Object
      .getOwnPropertySymbols(service.state)
      .filter(sym => sym.toString().includes('records'))
      ::first())

/******************************************************************************/
// Main
/******************************************************************************/

const useServiceRecord = (tree, id, path = []) => {

  useStateTree.observe(tree, id && [ getRecordsSymbol(tree), id, ...wrap(path) ])

  return id && tree.get(id)

}

/******************************************************************************/
// Extend
/******************************************************************************/

useServiceRecord.getSymbol = getRecordsSymbol

/******************************************************************************/
// Exports
/******************************************************************************/

export default useServiceRecord
