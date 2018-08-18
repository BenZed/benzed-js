
import { Modal, Flex, Scroll } from './layout'

import { Visible, Slide, Fade, ScrollVisible } from './effect'

import { GlobalStyle, Color, CssUnit, basic, branded } from './themes'

import { Store, Observer, Provider, observe, task } from './store'

import {
  isClient, isMobile, isEvent,
  storage,
  Cloner, CssCloner, Portal,
  Styler, $
} from './util'

/******************************************************************************/
// Compose
/******************************************************************************/

const themes = {
  basic, branded
}

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  // Layout
  Modal, Flex, Scroll,

  // Effect
  Visible, Slide, Fade, ScrollVisible,

  // Theming
  GlobalStyle, Color, CssUnit, themes,

  // Store
  Store, Observer, Provider, observe, task,

  // Util
  isClient, isEvent, isMobile, storage, Cloner, CssCloner, Portal, Styler, $

}
