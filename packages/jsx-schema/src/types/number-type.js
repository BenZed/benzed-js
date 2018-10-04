import SpecificType from './specific-type'

/******************************************************************************/
// Main
/******************************************************************************/

class NumberType extends SpecificType {

  constructor () {
    super(String)
  }

  cast (config) {
    return config === true
      ? super.cast(value => String(value))
      : super.cast(config)
  }

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default NumberType
