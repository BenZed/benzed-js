import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function addName (obj, name) {

  if (this !== undefined) {
    name = obj
    obj = this
  }

  if (!is.object(obj) && !is.func(obj))
    throw new Error('must be an object or function')

  return Object.defineProperty(obj, 'name', { value: name })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default addName
