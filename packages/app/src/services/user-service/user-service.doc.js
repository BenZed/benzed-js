import React from 'react'

/* eslint-disable react/prop-types */

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'UserService'
}

/******************************************************************************/
// Doc
/******************************************************************************/

const UserService = ({ Types, Detail }) =>
  <Types.Class info={INFO}>

    <p>
    User Service, complete with real time connection logic and permissions filtering.
    </p>

  </Types.Class>

/******************************************************************************/
// Exports
/******************************************************************************/

export { UserService }
