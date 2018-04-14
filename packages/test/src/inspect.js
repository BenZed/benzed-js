import { inspect as _inspect } from 'util'

/******************************************************************************/
// Main
/******************************************************************************/

function inspect (strings, ...params) {

  let str = ''
  for (let i = 0; i < strings.length; i++) {
    str += strings[i]
    if (i < params.length)
      str += _inspect(params[i])
  }

  return str
}

inspect.log = (strings, ...params) =>
  console.log(inspect(strings, ...params))

/******************************************************************************/
// Exports
/******************************************************************************/

export default inspect
