import React from 'react' // eslint-disable-line

/******************************************************************************/
// Doc
/******************************************************************************/

const INFO = {
  name: 'adjacent',
  args: {
    haystack: [ Array, 'Array of values.' ],
    needle:   [ '*', 'Value to get adjacent value of.' ],
    delta:    [ Number, 'Value to get adjacent value of.' ]
  },
  returns: [ '*', 'The adjacent value.' ]
}

const Adjacent = ({ Types, Detail: { Script } }) =>
  <Types.Function info={INFO} >

    The flatten function takes an Array and decomposes any nested arrays.

    <Script>{`
      import { adjacent } from '@benzed/string'

      const array = [ 'one', 'two', 'three' ]

      const next = array::adjacent('one')

      console.log(next) // 'two'
    `}</Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Adjacent }
