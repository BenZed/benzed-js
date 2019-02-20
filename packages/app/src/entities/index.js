import app from './app'
import express from './express'
import expressError from './express-error'
import socketio from './socketio'
import authentication from './authentication'
import service from './service'
import paginate from './paginate'
import mongod from './mongod'
import channels from './channels'
import * as hooks from './hooks'
import * as adapters from './adapters'
import { fromCamelCase } from '@benzed/string'
import { set } from '@benzed/immutable'

import expressUi from './express-ui'

import * as quickhooks from '../hooks'

/******************************************************************************/
// Map
/******************************************************************************/

const ENTITIES = {
  app,
  mongod,
  express,
  'express-error': expressError,
  'express-ui': expressUi,

  authentication,

  socketio,
  channels,

  service,
  paginate,
  ...Object.entries(hooks)
    .concat(Object.entries(adapters))
    .concat(Object.entries(quickhooks))
    .reduce((obj, [k, v]) => set.mut(obj, k::fromCamelCase(), v), {})
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ENTITIES
