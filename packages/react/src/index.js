
import { Modal, Flex, Scroll } from './layout'

import { GlobalStyle, basic } from './themes'

import { Store, Observer, Provider, observe, task } from './store'

import { isClient, isMobile, Cloner, styler } from './util'
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

  // Themes
  GlobalStyle, themes,

  // Store
  Store, Observer, Provider, observe, task,

  // Util
  isClient, isMobile, styler, styler as $, Cloner, Color

}
