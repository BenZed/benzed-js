
/******************************************************************************/
// Main
/******************************************************************************/

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
