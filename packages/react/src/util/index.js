import isClient from './is-client'
import isMobile from './is-mobile'
import isEvent from './is-event'
import emToPixels from './em-to-pixels'
import stripProps from './strip-props'

import nestInComponent from './nest-in-component'

import { Styler, $ } from './styler'

import { Cloner, CssCloner } from './cloner'

import Portal from './portal'

import storage from './storage'

import { addEventListener, on, removeEventListener, off } from './event-listener'

import {
  useDelay
} from './hooks'

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  addEventListener, on,
  removeEventListener, off,

  isClient,
  isMobile,
  isEvent,
  emToPixels,

  storage,

  nestInComponent,

  Cloner,
  CssCloner,
  Portal,

  Styler,
  $,

  useDelay,
  stripProps
}
