import Service from '../service'
import {
  hashPassword,
  validatePassword,
  removePassword
} from './hooks'

/******************************************************************************/
// Main
/******************************************************************************/

class UserService extends Service {

  addHooks (config, app) {

    const pass = {
      check: validatePassword(config['password-length']),
      hash: hashPassword(),
      remove: removePassword
    }

    this.before({
      create: [ pass.check, pass.hash ],
      patch:  [ pass.check, pass.hash ],
      update: [ pass.check, pass.hash ]
    })

    this.after({
      all:    [ pass.remove ]
    })

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UserService
