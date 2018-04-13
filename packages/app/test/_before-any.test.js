import fs from 'fs-extra'
import path from 'path'
import { CONFIG_OBJ, CONFIG_URL } from './util'
import { equals } from '@benzed/immutable'

// So we don't have to keep changing the config in serveral places

const defaultJsonUrl = path.join(CONFIG_URL, 'default.json')
const defaultJson = require(defaultJsonUrl.replace('.json', ''))

// only write it if config has changed, in case test folder
// is being watched
if (!equals(defaultJson, CONFIG_OBJ))
  fs.writeJsonSync(defaultJsonUrl, CONFIG_OBJ, { spaces: 2 })

// So tests are easier to scroll
console.clear()
