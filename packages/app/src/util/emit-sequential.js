import { wrap } from '@benzed/array'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

async function emitSequential (type, ...args) {

  const emitter = this

  const { _events: events } = emitter

  const handlers = wrap(events && events[type])
    .filter(is.defined)

  for (const handler of handlers)
    await handler(...args)

  return emitter

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default emitSequential
