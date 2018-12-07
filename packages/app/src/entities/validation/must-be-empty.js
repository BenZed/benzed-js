import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Main
/******************************************************************************/

const MustBeEmpty = <array key='children' length={[ 0, 'must be empty' ]} />

/******************************************************************************/
// Exports
/******************************************************************************/

export default MustBeEmpty
