import is from 'is-explicit'

import feathers from '@feathersjs/client'

import { Schema, arrayOf, string, required, oneOf, cast, length } from '@benzed/schema'
import { until } from '@benzed/async'

import Store from '../../store'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

/******************************************************************************/
// Data
/******************************************************************************/

const FEATHERS = Symbol('feathers-client-instance')

const CONFIG = Symbol('configuration')

/******************************************************************************/
// Validation
/******************************************************************************/

const boolToDefaultToken = value => value === true
  ? 'benzed-jwt'
  : value === false
    ? null
    : value

const validateConfig = new Schema(
  {
    hosts: arrayOf(
      string,
      required
    ),

    provider: oneOf(
      ['rest', 'socketio'],
      required
    ),

    auth: string(
      cast(boolToDefaultToken),
      length('>=', 3, 'token key must be at least 3 characters long')
    )
  },

  required('ClientStore configuration is required.')
)

/******************************************************************************/
// Private
/******************************************************************************/

async function setupRest () {
  const client = this

}

async function setupSocketIo () {
  const client = this

}

/******************************************************************************/
// Main
/******************************************************************************/

class ClientStore {

  [FEATHERS] = null;

  [CONFIG] = null

  get config () {
    return this[CONFIG]
  }

  constructor (config) {

    this[CONFIG] = Object.freeze(validateConfig(config))
    this[FEATHERS] = feathers()

    if (config.provider === 'rest')
      this::setupRest()
    else
      this::setupSocketIo()
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ClientStore
