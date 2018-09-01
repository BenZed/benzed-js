import React from 'react' // eslint-disable-line no-unused-vars

/* eslint-disable react/prop-types */

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'FileService',
  extends: 'Service'
}

/******************************************************************************/
// Doc
/******************************************************************************/

const FileService = ({ Types, Detail }) =>
  <Types.Class info={INFO}>

    <p>File Service, complete with storage logic, upload middleware and download middleware.</p>

  </Types.Class>

/******************************************************************************/
// Exports
/******************************************************************************/

export { FileService }
