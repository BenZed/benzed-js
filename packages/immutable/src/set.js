import copy from './copy'

/******************************************************************************/
// Main
/******************************************************************************/

function set (...args) {

  const obj = typeof this !== 'undefined'
    ? this
    : args.shift()

  const clone = copy(obj)

  // for (let i = 0; i < args.length; i++)

}

function setMutate (...args) {

  const obj = typeof this !== 'undefined'
    ? this
    : args.shift()


}

/******************************************************************************/
// Exports
/******************************************************************************/

set.mut = setMutate

export default set
