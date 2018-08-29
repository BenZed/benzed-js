import React from 'react'

/* eslint-disable react/prop-types */

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'between',
  args: {
    str: {
      type: String,
      description: 'Source string'
    },
    open: {
      type: String,
      description: 'Open marker'
    },
    close: {
      type: String,
      description: 'Close marker',
      default: 'open'
    }
  },
  returns: {
    type: [ String, null ],
    description: 'Substring of the source between the two makers, or null if nothing could be found.'
  }
}

/******************************************************************************/
// Doc
/******************************************************************************/

const Between = ({ Types, Detail }) =>
  <Types.Function info={INFO}>

    <p>The between function returns a subset of a string, that which exists between
    two delimeters.</p>

    <Detail.Script>{`
      import { between } from '@benzed/string'

      const text = between('<b>bold</b>', '<b>', '</b>')

      console.log(text) // bold
    `}</Detail.Script>

    <p>Returns null if markers cannot be found:</p>
    <Detail.Script>{`
      import { between } from '@benzed/string'

      const text = between('Hello world!', '{', '}')

      console.log(text) // null
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Between }
