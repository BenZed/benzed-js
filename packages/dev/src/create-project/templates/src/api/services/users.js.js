export default ({ api, auth }) => api && auth && `import { UserService } from '@benzed/app'

/******************************************************************************/
// Extends
/******************************************************************************/

class Users extends UserService {

  addHooks (config, app) {
    super.addHooks(config, app)
  }

}

/******************************************************************************/
// Export
/******************************************************************************/

export default Users
`
