import React from 'react'

/* eslint-disable react/prop-types */

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'observer',
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

const StoreObserver = ({ Types, Detail }) =>
  <Types.Component info={INFO}>

    The StoreObserver component is used to listen to Store state changes and
    disseminate them to child components.

    <Detail.Script>{`
      import { StoreObserver } from '@benzed/react'
    `}</Detail.Script>

  </Types.Component>

/******************************************************************************/
// Exports
/******************************************************************************/

export { StoreObserver }
