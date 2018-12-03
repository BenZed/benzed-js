
import App from '@benzed/app' // eslint-disable-line no-unused-vars
import path from 'path'
import { DocsService } from './services'
import DocsGenerate from './docs-generate'
/* @jsx App.declareEntity */
/* eslint-disable react/react-in-jsx-scope */
/******************************************************************************/
// Data
/******************************************************************************/

const PORT = 5100
const DATA = path.resolve(__dirname, '../../')
const ROOT = path.resolve(__dirname, '../../../')

/******************************************************************************/
// Main
/******************************************************************************/

const DocumentationApi = () =>

  <app port={PORT}>

    <express public='documentation/dist/public' />

    <DocsService data={DATA} />
    <DocsGenerate root={ROOT} />

  </app>

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocumentationApi
