
/******************************************************************************/
// Data
/******************************************************************************/

const DEFAULT_REM = 16

let bodyComputedStyle

/******************************************************************************/
// Main
/******************************************************************************/

function emToPixels (element) {

  if (typeof window === 'undefined')
    return DEFAULT_REM

  element = this || element

  if (!element && !bodyComputedStyle)
    bodyComputedStyle = getComputedStyle(document.body)

  const computedStyle = !element
    ? bodyComputedStyle
    : getComputedStyle(element)

  const fontSizeStr = computedStyle
    .getPropertyValue('font-size')
    .replace('px', '')

  return parseFloat(fontSizeStr)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default emToPixels
