import is from 'is-explicit'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Validation
/******************************************************************************/

const isArrayEmptyOrOfFunctions = arr =>
  arr.length === 0 || is.arrayOf.func(arr)

/******************************************************************************/
// Main
/******************************************************************************/

function registerToFeathers (app, path, adapter, config) {

  const service = this
  const { feathers } = app

  let middleware = service
    .addMiddleware(config, app)

  middleware = is.defined(middleware)
    ? wrap(middleware)
    : []

  if (!isArrayEmptyOrOfFunctions(middleware))
    throw new Error('addMiddleware should return an array of functions')

  // if the service instance is in the middleware array, its to deliniate
  // where the other middleware functions are intended to be registered in
  // relation.
  // middleware = [ func1, this, func2 ]
  // means func1 is supposed to be registered before the service adapter,
  // and func2 is to be registered after
  if (middleware.includes(service))
    middleware.splice(middleware.indexOf(service), 1, adapter)

  // otherwise, any middleware provided should be registered before the adapter
  else
    middleware.push(adapter)

  return feathers
    .use(`/${path}`, ...middleware)
    .service(path)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default registerToFeathers
