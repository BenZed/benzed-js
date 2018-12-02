import { $$entity } from './symbols'
import setupNedbService from './setup-nedb-service'
import setupVersionsService from './setup-versions-service'
import getPort from './get-port'
import emitSequential from './emit-sequential'

import isService from './is-service'

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  getPort,
  emitSequential,
  setupNedbService,
  setupVersionsService,

  isService,
  // isApp

  $$entity
}
