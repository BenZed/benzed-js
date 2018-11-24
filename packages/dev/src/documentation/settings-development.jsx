/* @jsx jsxToData */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable-next-line no-unused-vars */
import jsxToData from './api/temp/jsx-to-data'
import path from 'path'

/******************************************************************************/
// Data
/******************************************************************************/

const PORT = 5100
const DATA = path.resolve(__dirname, '../../')
const ROOT = path.resolve(__dirname, '../../../')

/******************************************************************************/
// Exports
/******************************************************************************/

export default <app port={PORT}>

  <rest
    public='documentation/dist/public'
  />

  <docs
    root={ROOT}
  >
    <nedb
      filename={path.join(DATA, '.doc-data.db')}
    />
    <paginate
      default={50}
      max={100}
    />
  </docs>

</app>
