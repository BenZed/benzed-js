
import App from '@benzed/app' // eslint-disable-line no-unused-vars
import path from 'path'
import * as services from './services'
import generateDocumentation from './docs-generate'
/* @jsx App.declareEntity */
/* eslint-disable react/react-in-jsx-scope */
/******************************************************************************/
// Data
/******************************************************************************/

const PORT = 5100
const DATA = path.resolve(__dirname, '../../')
const ROOT = path.resolve(__dirname, '../../../../')

const processes = {
  generateDocumentation
}

/******************************************************************************/
// Main
/******************************************************************************/

const DocumentationApi = () =>

  <app port={PORT}>

    <express />

    <services.documentation
      data={DATA}
    />

    <processes.generateDocumentation
      root={ROOT}
    />

    <express-ui
      public='./lib/documentation/public'
      serialize-errors
    />

  </app>

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocumentationApi
