import React from 'react' // eslint-disable-line

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'flatten',
  args: {
    array: {
      type: Array,
      description: 'Array to flatten.'
    }
  },
  returns: {
    type: Array,
    description: 'Flattened array.'
  }
}

/******************************************************************************/
// Doc
/******************************************************************************/

const Flatten = ({ Types, Detail }) =>
  <Types.Function info={INFO}>

    The flatten function takes an Array and decomposes any nested arrays.

    <Detail.Script>{`
      import { flatten } from '@benzed/string'

      const flattened = flatten([1, [2], [3, [4]]])
      console.log(flattened) // [1, 2, 3, 4]
    `}</Detail.Script>

    Optionally bindable
    <Detail.Script>{`
      const flattened = [1, [2]]::flatten()
      console.log(flattened) // [1, 2]
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Flatten }
