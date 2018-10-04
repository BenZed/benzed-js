import SpecificType from './specific-type'

/******************************************************************************/
// Main
/******************************************************************************/

class StringType extends SpecificType {

  constructor () {
    super(String)
  }

  cast (config) {
    return config === true
      ? super.cast(value => String(value))
      : super.cast(config)
  }

  format () {

  }

  uppercase () {

  }

  lowercase () {

  }

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default StringType
