
import {
  ClientStateTree,
  ServiceStateTree,
  UiStateTree,

  Login,

  ServiceView

} from './app'

import {
  Modal, Flex, Scroll
} from './layout'

import {
  Table, Grid, Virtual
} from './data-view'

import { } from './data-form'

import {
  Visible, Slide, Fade, ScrollVisible, Write
} from './effect'

import {
  GlobalStyle, Color, CssUnit, basic, branded
} from './themes'

// import {
//   Store, StoreObserver, StoreProvider, StoreConsumer, task
// } from './store'

import {
  StateTree, StateTreeObserver, StateTreeProvider, StateTreeListener, StateTreeConsumer
} from './state-tree'

import {
  isClient, isMobile, isEvent,
  storage,
  Cloner, CssCloner, Portal,
  Styler, $,
  addEventListener, on,
  removeEventListener, off
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

  // DataView
  Table, Grid, Virtual,

  // Effect
  Visible, Slide, Fade, ScrollVisible, Write,

  // Theming
  GlobalStyle, Color, CssUnit, themes,

  // State Tree
  StateTree, StateTreeObserver, StateTreeProvider, StateTreeConsumer, StateTreeListener,

  // App
  Login, ServiceView, ClientStateTree, ServiceStateTree, UiStateTree,

  // Util
  isClient, isEvent, isMobile, storage, Cloner, CssCloner, Portal, Styler, $,
  addEventListener, on, removeEventListener, off
}
