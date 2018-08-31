import React from 'react'

/* eslint-disable react/prop-types */

/******************************************************************************/
// Doc
/******************************************************************************/

const INFO = {
  name: 'shuffle',
  args: {
    arr: {
      type: Array,
      description: 'Array to shuffle.'
    }
  },
  returns: {
    type: Array,
    description: 'Shuffled array.'
  }
}

const Shuffle = ({ Types, Detail: { Script } }) =>

  <Types.Function info={INFO} >

    <p>The shuffle function randomizes the order of an array.
      Mutates the array in place, does not return a new array:</p>
    <Script>{`
      import { shuffle } from '@benzed/array'

      const arr = [ 1, 2, 3, 4, 5, 6 ]
      shuffle(arr)

      console.log(arr) // will now be in a random order
    `}</Script>

    <p>Optionally Bindable:</p>
    <Script>{`
      const arr = [ 1, 2, 3, 4, 5, 6 ]
      arr::shuffle()
    `}</Script>

    <p>Also works on strings:</p>
    <Script>{`
      const str = '1234578'
      str::shuffle() // returns a randomized string
    `}</Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Shuffle }
