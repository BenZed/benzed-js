
import { Modal, Flex, Scroll } from './layout'

import { Visible, Slide, Fade, ScrollVisible } from './effect'

import { GlobalStyle, basic } from './themes'

import { Store, Observer, Provider, observe, task } from './store'

import { isClient, isMobile, Cloner, styler, $ } from './util'

import Color from 'color'

/******************************************************************************/
// Compose
/******************************************************************************/

const themes = {
  basic
}

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  // Layout
  Modal, Flex, Scroll,

  // Effect
  Visible, Slide, Fade, ScrollVisible,

  // Themes
  GlobalStyle, themes,

  // Store
  Store, Observer, Provider, observe, task,

  // Util
  isClient, isMobile, Cloner, Color, styler, $

}
