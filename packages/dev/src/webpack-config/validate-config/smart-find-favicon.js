import path from 'path'
import searchFolder from './search-folder'

/******************************************************************************/
// Main
/******************************************************************************/

function smartFindFavicon (cwd, inputFile) {

  const inputFolder = path.dirname(inputFile)
  const faviconUrl = searchFolder({
    dir: inputFolder,
    test: ::/fav-?icon\./i.test
  })

  return faviconUrl
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default smartFindFavicon
