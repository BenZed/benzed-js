
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Clamps a value between a min and a max.
 *
 * Can also be bound, in which case 'this' becomes the clamped number, and the
 * min and max params are shifted down.
 *
 * @param  {number} value Value to clamp.
 * @param  {number} min
 * @param  {number} max
 * @return {number}         Clamped number.
 */
function clamp (...args) {

  let num, min, max

  // handles #::clamp(#,#) while giving proper defaults
  if (typeof this === 'number') {
    ([ min = 0, max = 1 ] = args)
    num = this
  } else
    ([ num, min = 0, max = 1 ] = args)

  return num < min ? min : num > max ? max : num

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default clamp
