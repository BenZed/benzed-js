import is from 'is-explicit'

/******************************************************************************/
// Validation
/******************************************************************************/

const isEmptyArrayOrArrayOfFunctions = arr =>
  is(arr, Array) &&
  (arr.length === 0 || is.arrayOf(arr, Function))

/******************************************************************************/
// Main
/******************************************************************************/

function registerToFeathers (app, path, adapter, config) {

  const serviceScaffold = this

  const { feathers } = app

  const preWare = serviceScaffold.preRegisterWare(config, app)
  if (!isEmptyArrayOrArrayOfFunctions(preWare))
    throw new Error('onPreRegister should return an array of functions')

  const postWare = serviceScaffold.postRegisterWare(config, app)
  if (!isEmptyArrayOrArrayOfFunctions(preWare))
    throw new Error('onPostRegister should return an array of functions')

  return feathers
    .use(`/${path}`, ...preWare, adapter, ...postWare)
    .service(path)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default registerToFeathers
