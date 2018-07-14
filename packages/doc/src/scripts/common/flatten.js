import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function flatten (input) {
  return input.reduce((output, item) => {
    if (is.array(item))
      output.push(...flatten(item))
    else
      output.push(item)

    return output
  }, [])
}
/******************************************************************************/
// Exports
/******************************************************************************/

export default flatten
