import Service from './service'
import { Schema, oneOf, object, string, required } from '@benzed/schema'

import { mustBeEnabled, folderExists } from '../util/validation'

/******************************************************************************/
// Validation
/******************************************************************************/

const s3NotYetSupported = value =>
  value === 's3'
    ? new Error('\'s3\' not yet supported.')
    : value

const validateSettings = new Schema({
  rest: mustBeEnabled('File Service requires rest to be enabled.')
})

const validateConfig = new Schema(
  object({
    storage: object({
      type: oneOf(
        ['local', 's3'],
        s3NotYetSupported,
        required
      ),
      location: string(
        folderExists
      )
    },
    required('object is required.'))
  },
  required)
)

/******************************************************************************/
// Main
/******************************************************************************/

class FileService extends Service {

  constructor (config, name, app) {

    validateSettings(app.config)
    config = validateConfig(config)

    super(config, name, app)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default FileService
