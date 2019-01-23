
import {
  ClientStateTree,
  ServiceStateTree,
  UiStateTree,

  Login,

  ServiceView,
  ServiceTable

} from './app'

import {
  Modal, Flex, Scroll
} from './layout'

import {
  Label
} from './text'

import {
  Table, Grid, Virtual
} from './data-view'

import Form from './data-form'

console.log(Form)

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
  isClient, isMobile, isEvent, emToPixels,
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

  // Input
  Form,

  // Text
  Label,

  // DataView
  Table, Grid, Virtual,

  // Effect
  Visible, Slide, Fade, ScrollVisible, Write,

  // Theming
  GlobalStyle, Color, CssUnit, themes,

  // State Tree
  StateTree, StateTreeObserver, StateTreeProvider, StateTreeConsumer,
  StateTreeListener,

  // App
  Login, ServiceView, ServiceTable, ClientStateTree, ServiceStateTree,
  UiStateTree,

  // Util
  isClient, isEvent, isMobile, emToPixels, storage, Cloner, CssCloner, Portal,
  Styler, $, addEventListener, on, removeEventListener, off
}
