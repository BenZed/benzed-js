import React from 'react'

/* eslint-disable react/prop-types */

/******************************************************************************/
// Doc
/******************************************************************************/

const INFO = {
  name: 'adjacent',
  args: {
    arr: {
      type: Array,
      description: 'Array to mutate.'
    },
    test: {
      type: Function,
      description: 'Predicate to run on each item'
    },
    count: {
      type: Number,
      description: 'Max number of items to pluck',
      default: 'arr.length'
    }
  },
  returns: {
    type: Array,
    description: 'Items removed via test.'
  }
}

const Pluck = ({ Types, Detail: { Script } }) =>

  <Types.Function info={INFO} >

    <p>The pluck function removes a number of items from an array that pass a test:</p>
    <Script>{`
      import { pluck } from '@benzed/string'

      const arr = [ 1, 2, 3, 4, 5, 6 ]
      const even = pluck(arr, n => n % 2 === 0)

      console.log(even) // [ 2, 4, 6 ]
      console.log(arr) // [ 1, 3, 5 ]
    `}</Script>

    <p>The input array is mutated, and items that pass the test are returned in a new array.</p>

    <p>Can also take a count argument, which maximizes the number of elements returned:</p>
    <Script>{`
      const arr = [ 1, 2, 3, 4, 5, 6 ]
      const firstTwoOdd = pluck(arr, n => n % 2 === 1, 2)

      console.log(firstTwoOdd) // [ 1, 3 ]
      console.log(arr) // [ 2, 4, 5, 6 ]
    `}</Script>

    <p>pluck is also optionally bindable:</p>
    <Script>{`
      const arr = [ 1, 2, 3, 4, 5, 6 ]
      const odd = arr::pluck(n => n % 2 === 1)

      console.log(odd) // [ 1, 3, 5 ]
      console.log(arr) // [ 2, 4, 6 ]
    `}</Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Pluck }
