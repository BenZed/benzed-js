import is from 'is-explicit'
import smartFindEntry from './smart-find-entry'
import smartFindOutput from './smart-find-output'
import smartFindHtml from './smart-find-html'
import smartFindFavicon from './smart-find-favicon'

/******************************************************************************/
// Main
/******************************************************************************/

function validateConfig (config = { }) {

  const path = require('path')

  if (!is.plainObject(config))
    throw new Error(`if defined, config must be a plain object`)

  const cwd = config.cwd || process.cwd()
  const name = config.name || path.basename(cwd)
  const inputFile = config.entry || smartFindEntry(cwd)
  const outputDir = config.output || smartFindOutput(cwd)
  const htmlTemplate = config.html || smartFindHtml(cwd, inputFile)
  const faviconUrl = config.favicon || smartFindFavicon(cwd, inputFile)
  const port = config.port || 5000

  const mode = config.mode || (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development')

  if (mode !== 'development' && mode !== 'production')
    throw new Error(`config.mode must either be production or development`)

  return { name, inputFile, outputDir, htmlTemplate, mode, port, faviconUrl }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validateConfig
