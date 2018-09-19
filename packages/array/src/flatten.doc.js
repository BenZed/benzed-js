import React from 'react'

/* eslint-disable react/prop-types */

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

const flatten = ({ Types, Detail }) =>
  <Types.Function info={INFO}>

    <p>The flatten function takes an Array and decomposes any nested arrays.</p>
    <Detail.Script>{`
      import { flatten } from '@benzed/array'

      const flattened = flatten([1, [2], [3, [4]]])
      console.log(flattened) // [1, 2, 3, 4]
    `}</Detail.Script>

    <p>Optionally bindable</p>
    <Detail.Script>{`
      const flattened = [1, [2]]::flatten()
      console.log(flattened) // [1, 2]
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { flatten }
