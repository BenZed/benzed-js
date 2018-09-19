import React from 'react' // eslint-disable-line no-unused-vars

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'fromCamelCase',
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

const fromCamelCase = ({ Types, Detail }) =>
  <Types.Function info={INFO}>

    Describe the fromCamelCase function.

    <Detail.Script>{`
      import { fromCamelCase } from '@benzed/string'
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { fromCamelCase }
