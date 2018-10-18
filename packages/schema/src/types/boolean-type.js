import SpecificType from './specific-type'
import is from 'is-explicit'

/******************************************************************************/
// Default Cast
/******************************************************************************/

const toBoolean = value =>

  is.string(value)
    ? /^true$/i.test(value)

      ? true
      : /^false$/i.test(value)

        ? false
        : value

    : is.object(value)
      ? value
      : !!value

/******************************************************************************/
// Main
/******************************************************************************/

class BooleanType extends SpecificType {

  constructor () {
    super(Boolean)
  }

  cast (config) {
    if (config === true)
      config = toBoolean

    return super.cast(config)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default BooleanType
