
// TODO move me to util

/******************************************************************************/
// Data
/******************************************************************************/

const $$tree = Symbol('tree-static-internal')
const $$state = Symbol('tree-instance-state')
const $$subscribers = Symbol('tree-subscribers')

/******************************************************************************/
// Exports
/******************************************************************************/

export {
  $$tree,
  $$state,
  $$subscribers
}
