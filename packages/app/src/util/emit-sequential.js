import { wrap } from '@benzed/array'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

async function emitSequential (type, ...args) {

  const emitter = this

  const { _events } = emitter

  const handlers = wrap(_events && _events[type])
    .filter(is.defined)

  for (const handler of handlers)
    await handler(...args)

  return emitter

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default emitSequential
