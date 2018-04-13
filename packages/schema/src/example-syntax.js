class Schema {}

const noop = () => {}
const required = noop
const format = noop
const length = noop
const range = noop

/******************************************************************************/
// EXample
/******************************************************************************/

const schema = new Schema({

  name: [
    String,
    required,
    format(/[A-z]\s/),
    length(0, 64)
  ],

  scores: [
    [Number],
    range(0, 5),
    length(0, 100)
  ]

})
