import App from '@benzed/app' // eslint-disable-line no-unused-vars
import path from 'path'

import { disallow } from 'feathers-hooks-common'

/* @jsx App.declareEntity */
/* eslint-disable react/react-in-jsx-scope, react/display-name, react/prop-types */

/******************************************************************************/
// Hooks
/******************************************************************************/

const internal = disallow('external')
const illegal = disallow()

/******************************************************************************/
// Main
/******************************************************************************/

const DocsService = ({ data }) =>

  <service name='docs'>

    <nedb filename={path.join(data, 'docs.db')} />
    <paginate default={50} max={100} />

    <hooks before all>
      <authenticate />
    </hooks>

    <hooks before create update remove>
      {internal}
    </hooks>

    <hooks before update>
      {illegal}
    </hooks>

  </service>

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocsService
