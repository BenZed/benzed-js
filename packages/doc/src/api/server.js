import { App } from '@benzed/app'
import * as services from './services'

import Website from '../ui/root/website'
import docs from '../docs'

/******************************************************************************/
// Static Website
/******************************************************************************/

const StaticWebsite = () =>
  <Website packages={docs} />

/******************************************************************************/
// App
/******************************************************************************/

class DocumentationServer extends App {

  services = services

  getClientComponent () {
    return StaticWebsite
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocumentationServer
