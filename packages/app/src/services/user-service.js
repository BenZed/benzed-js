import Service, { validateFunctionality } from './service'
import is from 'is-explicit'
import { discard, iff, isProvider } from 'feathers-hooks-common'
import { merge } from '@benzed/immutable'

import { validatePassword } from './hooks'

/******************************************************************************/
// Merge Hooks
/******************************************************************************/

function mergeHooks (a, b) {

  if (!b)
    return a

  const merged = merge(a, b)
  return merged
}

function createUserHooks (customHooks) {

  if (!is(customHooks, Function)) {
    const value = customHooks
    customHooks = () => value
  }

  // Hooks
  const passHash = require('@feathersjs/authentication-local').hooks.hashPassword()
  const passRemove = iff(isProvider('external'), discard('password'))

  return (config, name) => {

    const passValidate = validatePassword(config.passwordLength)

    const userHooks = {
      before: {
        create: [ passValidate, passHash ],
        patch:  [ passValidate, passHash ],
        update: [ passValidate, passHash ]
      },
      after: {
        all: [ passRemove ]
      }
    }

    return mergeHooks(userHooks, customHooks(config, name))

  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function UserService (functionality) {

  functionality = validateFunctionality(functionality) || {}

  const { hooks: customHooks } = functionality

  functionality.hooks = createUserHooks(customHooks)

  return Service(functionality)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UserService
