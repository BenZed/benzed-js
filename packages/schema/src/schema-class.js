
/******************************************************************************/
// Dummies
/******************************************************************************/

class Validator {
  constructor () {
    return function () {}
  }
}

class Schema {

}

function length () { return () => {} }
function defaultTo () { return () => {} }
function oneOf () { return () => {} }

function string () {}
function object () {}
function required () {}

const customValidator = new Validator()

/******************************************************************************/
// Example Syntax
/******************************************************************************/

const Config = new Schema({

  name: object({

    first: string,

    last: string
      ::required
      ::length('>=', 4)

  })::required,

  room: string::defaultTo('100'),

  meta: {

    hosts: [
      oneOf(0, 100, 'fall', false, true)
    ]::required::length(4)

  },

  @required('You fucked up')
  @length(4)
  hosts: [String],

  // meta: [{
  //   @required
  //   cake: String
  // }]

})

console.log(Config)
/******************************************************************************/
// Exports
/******************************************************************************/

export default Config
