import React from 'react'

/* eslint-disable react/prop-types */

/******************************************************************************/
// Wrap
/******************************************************************************/

const WRAP_INFO = {
  name: 'wrap',
  args: {
    arr: {
      type: '*',
      description: 'Value to wrap.'
    }
  },
  returns: {
    type: Array,
    description: 'Wrapped value.'
  }
}

const wrap = ({ Types, Detail: { Script } }) =>

  <Types.Function info={WRAP_INFO} >

    <p>The wrap function ensures that a given value is an array. If it is not an
      array, the value gets wrapped into one:</p>
    <Script>{`
      import { wrap } from '@benzed/array'

      const one = wrap(1)

      console.log(one) // [1]
      console.log(wrap(one)) // [1]
    `}</Script>

    <p>Optionally Bindable:</p>
    <Script>{`
      1::wrap() // [1]
    `}</Script>

  </Types.Function>

/******************************************************************************/
// Unwrap
/******************************************************************************/

const UNWRAP_INFO = {
  name: 'unwrap',
  args: {
    arr: {
      type: '*',
      description: 'Value to unwrap.'
    }
  },
  returns: {
    type: '*',
    description: 'Unwrapped value.'
  }
}

const unwrap = ({ Types, Detail: { Script } }) =>

  <Types.Function info={UNWRAP_INFO} >

    <p>The unwrap function ensures that a given value is not an array. If it is an
      array, the first element in the array is returned:</p>
    <Script>{`
      import { unwrap } from '@benzed/array'

      const one = unwrap([1])

      console.log(one) // 1
      console.log(unwrap(one)) // 1
    `}</Script>

    <p>Optionally Bindable:</p>
    <Script>{`
      [1]::unwrap() // 1
    `}</Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { wrap, unwrap }
