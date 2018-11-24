import { disallow } from 'feathers-hooks-common'

/******************************************************************************/
// Setup
/******************************************************************************/

const internal = disallow('external')
const illegal = disallow()

/******************************************************************************/
// Exports
/******************************************************************************/

export default (settings) => {

  const before = {
    create: [ internal ],
    patch: [ internal ],
    update: [ illegal ],
    remove: [ internal ]
  }

  const after = { }

  const error = { }

  return {
    before,
    after,
    error
  }
}
