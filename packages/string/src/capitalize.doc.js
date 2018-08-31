import React from 'react' // eslint-disable-line no-unused-vars

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'capitalize',
  args: {
    argName: {
      type: '*',
      description: 'arg description'
    }
  },
  returns: {
    type: undefined,
    description: 'Does not return anything.'
  }
}

/******************************************************************************/
// Doc
/******************************************************************************/

const Capitalize = ({ Types, Detail }) =>
  <Types.Function info={INFO}>

    Describe the capitalize function.

    <Detail.Script>{`
      import { capitalize } from '@benzed/string'
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Capitalize }
