import React from 'react' // eslint-disable-line no-unused-vars

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'between',
  args: {
    str: {
      type: 'string',
      description: 'Source string'
    },
    open: {
      type: 'string',
      description: 'Open marker'
    },
    close: {
      type: 'string',
      description: 'Close Maker',
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

    Describe the between function.

    <Detail.Script>{`
      import { between } from '@benzed/string'
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Between }
