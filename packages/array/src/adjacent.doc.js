import React from 'react'

/* eslint-disable react/prop-types */

/******************************************************************************/
// Doc
/******************************************************************************/

const INFO = {
  name: 'adjacent',
  args: {
    haystack: {
      type: Array,
      description: 'Array of values.'
    },
    needle: {
      type: '*',
      description: 'Value to get adjacent value of.'
    },
    delta: {
      type: Number,
      description: 'Number of adjacent indexes to jump.',
      default: 1
    }
  },
  returns: {
    type: '*',
    description: 'The adjacent value.'
  }
}

const adjacent = ({ Types, Detail: { Script } }) =>

  <Types.Function info={INFO} >

    <p>The adjacent function gets the neighbour of the supplied value in an array:</p>
    <Script>{`
      import { adjacent } from '@benzed/array'

      const next = adjacent([ 'one', 'two', 'three' ], 'one')
      console.log(next) // 'two'
    `}</Script>

    <p>If the supplied value is at the end of the array, the returned value will
    be wrapped around:</p>
    <Script>{`
      const first = adjacent([ 1, 2, 3, 4 ], 4)
      console.log(first) // 1
    `}</Script>

    <p>Optionally takes a delta argument:</p>
    <Script>{`
      const array = [ 'min', 1, 2, 3, 'max' ]
      const two = adjacent(array, 'min', 2)
      console.log(two) // 2

      const min = adjacent(array, 'max', -4)
      console.log(min) // 'min'
    `}</Script>

    <p>Optionally bindable:</p>
    <Script>{`
      const three = [1,2,3]::adjacent(1, 2)
      console.log(three) // 3
    `}</Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { adjacent }