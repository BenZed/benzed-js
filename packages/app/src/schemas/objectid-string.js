import ObjectID from 'bson-objectid'
import is from 'is-explicit'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validator
/******************************************************************************/

const toObjectIdString = input =>
  is.defined(input)

    ? ObjectID.isValid(input)

      ? String(input)
      : throw new Error('must be ObjectID compliant.')

    : String(ObjectID())

/******************************************************************************/
// Main
/******************************************************************************/

const ObjectIdString = <string cast validate={toObjectIdString} />

/******************************************************************************/
// Exports
/******************************************************************************/

export default ObjectIdString
