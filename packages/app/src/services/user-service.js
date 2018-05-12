import Service from './service'
import { hashPassword, validatePassword } from '../hooks'

/******************************************************************************/
// Main
/******************************************************************************/

class UserService extends Service {

  hooks (config, app) {

    const pass = {
      check: validatePassword(config['password-length']),
      hash: hashPassword()
    }

    this.before({
      create: [ pass.check, pass.hash ],
      patch:  [ pass.check, pass.hash ],
      update: [ pass.check, pass.hash ]
    })

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UserService
