import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Determine if input is an event.
 *
 * @param  {*} input Value to test.
 * @return {boolean} True if input is an event, false if not.
 */
function isEvent (e) {
  return is.object(e) && 'target' in e
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isEvent
