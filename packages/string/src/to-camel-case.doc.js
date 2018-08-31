import React from 'react' // eslint-disable-line no-unused-vars

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'toCamelCase',
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

const ToCamelCase = ({ Types, Detail }) =>
  <Types.Function info={INFO}>

    Describe the toCamelCase function.

    <Detail.Script>{`
      import { toCamelCase } from '@benzed/string'
    `}</Detail.Script>

  </Types.Function>

/******************************************************************************/
// Exports
/******************************************************************************/

export { ToCamelCase }
