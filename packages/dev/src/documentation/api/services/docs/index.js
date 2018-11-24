import { setupNedbService } from '../../temp'
import hooks from './hooks'
import generateDocs from './generate'

/******************************************************************************/
// Main
/******************************************************************************/

function docsService (settings) {

  const app = this

  const service = app::setupNedbService('docs', settings)

  const { before, after, error } = hooks(settings)

  service.hooks({
    before,
    after,
    error
  })

  app::generateDocs()

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default docsService
