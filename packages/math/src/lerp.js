
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Linearly interpolate a number to a target according to a delta.
 *
 * @param  {number} from
 * @param  {number} to
 * @param  {number} factor Factor by which to interpolate
 * @return {number} Inerpolated value.
 */
function lerp (from, to, factor) {

  // handles #::lerp(#,#)
  if (typeof this === 'number') {
    factor = to
    to = from
    from = this
  }

  return from + factor * (to - from)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default lerp
