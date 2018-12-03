import app from './app'
import express from './express'
import expressError from './express-error'
import socketio from './socketio'
import authentication from './authentication'
import service from './service'
import paginate from './paginate'
import mongod from './mongod'
import * as hooks from './hooks'
import * as adapters from './adapters'
import { fromCamelCase } from '@benzed/string'
import { set } from '@benzed/immutable'

import * as quickhooks from '../hooks'

/******************************************************************************/
// Map
/******************************************************************************/

const ENTITIES = {
  app,
  mongod,
  express,
  'express-error': expressError,
  socketio,
  authentication,
  service,
  paginate,
  ...Object.entries(hooks)
    .concat(Object.entries(adapters))
    .concat(Object.values(quickhooks)
      .filter((func) => func.name !== 'QuickHook')
      .map(func => [
        func.name.replace('build', ''),
        options => hooks.hook({ ...options, func })
      ])
    )
    .reduce((obj, [k, v]) => set.mut(obj, k::fromCamelCase(), v), {})
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ENTITIES
