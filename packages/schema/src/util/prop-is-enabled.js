
/******************************************************************************/
// Main
/******************************************************************************/

// Why?
// Well, for starters, a prop may still represent an enabled validator for
// some falsy values like 0.
// I may later wish to extend it so that an object
// with the shape of { enabled: false } could represent a disabled
// validator

const propIsEnabled = prop =>
  prop != null && prop !== false

/******************************************************************************/
// Exports
/******************************************************************************/

export default propIsEnabled
