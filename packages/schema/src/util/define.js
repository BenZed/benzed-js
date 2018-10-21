import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function define (obj, fields) {

  if (this !== undefined) {
    fields = obj
    obj = this
  }

  if (!is.object(obj) && !is.func(obj))
    throw new Error('must be an object or function')

  for (const key in fields)
    Object.defineProperty(obj, key, { value: fields[key] })

  return obj

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default define
