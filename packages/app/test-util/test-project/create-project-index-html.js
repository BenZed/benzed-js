import path from 'path'
import fs from 'fs-extra'

/******************************************************************************/
// Data
/******************************************************************************/

const TEMP_DIR = path.resolve(__dirname, '../../temp')

/******************************************************************************/
// Helper
/******************************************************************************/

const testIndexHtml = (id = 'test-project') => `<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
  </head>
  <body>
    <main id='${id}'/>
  </body>
</html>
`

/******************************************************************************/
// Main
/******************************************************************************/

function createProjectIndexHtml (name) {
  const publicDir = path.join(TEMP_DIR, name, 'public')
  const htmlFile = path.join(publicDir, 'index.html')

  if (!fs.existsSync(htmlFile)) {
    fs.ensureDirSync(publicDir)
    fs.writeFileSync(htmlFile, testIndexHtml(name))
  }

  return publicDir
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProjectIndexHtml

export { TEMP_DIR }
