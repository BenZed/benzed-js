import React from 'react' // eslint-disable-line
import flatten from './flatten'

/******************************************************************************/
// Doc
/******************************************************************************/

const Flatten = ({ Types, Detail }) =>
  <Types.Function
    func={flatten}
  >
    The flatten function takes an Array and decomposes any nested arrays.

    <Detail.Script>{`
      import { flatten } from '@benzed/string'

      const flattened = [1, [2], [3, [4]]]::flatten()

      console.log(flattened) // [1, 2, 3, 4]
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Flatten }
