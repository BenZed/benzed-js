import { Color, themes, Styler } from '@benzed/react'
import { merge } from '@benzed/immutable'

/******************************************************************************/
// Data
/******************************************************************************/

const fg = new Color('#abb2bf')
const bg = new Color('#282c34')

/******************************************************************************/
// Theme
/******************************************************************************/

const theme = merge(themes.basic, {

  fg: bg.mix(new Color('white'), 0.1),
  bg: fg.mix(new Color('white'), 0.75),

  codefg: fg,
  codebg: bg,

  brand: {

    primary: new Color('darkorange'),

    comment: new Color('#5c6370'),
    keyword: new Color('#c678dd'),
    literal: new Color('#56b6c2'),
    string: new Color('#98c379'),
    substring: new Color('#e06c75'),
    builtin: new Color('#e6c07b'),
    type: new Color('#d19a66'),
    link: new Color('#61aeee')
  }

})

/******************************************************************************/
// Styler
/******************************************************************************/

const $ = Styler.createInterface(theme)

/******************************************************************************/
// Exports
/******************************************************************************/

export default $

export {
  $, theme
}
