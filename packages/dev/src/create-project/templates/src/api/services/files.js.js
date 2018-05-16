export default ({ api, files }) => api && files && `import { FileService } from '@benzed/app'

/******************************************************************************/
// Extends
/******************************************************************************/

class Files extends FileService {

  addHooks (config, app) {
    super.addHooks(config, app)
  }

}

/******************************************************************************/
// Export
/******************************************************************************/

export default Files
`
