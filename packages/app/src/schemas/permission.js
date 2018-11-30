import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Main
/******************************************************************************/

const Permission = <bool default={false} cast />

Permission.RW = <oneOf default='none'>{[
  'none', 'read', 'write'
]}</oneOf>

Permission.RWM = <oneOf default='none'>{[
  'none', 'read', 'write', 'manage'
]}</oneOf>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Permission
