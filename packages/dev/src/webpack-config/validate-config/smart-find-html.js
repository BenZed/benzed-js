import searchFolder from './search-folder'

/******************************************************************************/
// Main
/******************************************************************************/

function smartFindHtml (cwd, inputFile) {

  const fs = require('fs')
  const path = require('path')

  const inputFolder = path.dirname(inputFile)

  const html = searchFolder({
    dir: inputFolder,
    test: name => name === 'index.html',
    recursive: true
  })

  if (fs.existsSync(html))
    return html

  throw new Error('config.html was not provided, and an html template could be found.')

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default smartFindHtml
