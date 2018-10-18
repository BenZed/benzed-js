
/******************************************************************************/
// Main
/******************************************************************************/

function propsPluck (...args) {

  const props = this === undefined
    ? args.shift()
    : this

  const names = args

  let output = null
  for (const name of names)
    if (name in props) {
      output = output || {}
      output[name] = props[name]
      delete props[name]
    }

  return output
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default propsPluck
