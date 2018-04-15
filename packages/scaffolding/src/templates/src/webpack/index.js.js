
export default ({ has, Frontend, projectName }) => has.ui && `

import './globals'

import addEventListener from 'add-event-listener'

import React from 'react'
import { ${has.api ? 'hydrate' : 'render'} } from 'react-dom'

import ${Frontend} from './components/${Frontend}'

/******************************************************************************/
// Execute
/******************************************************************************/

addEventListener(window, 'load', () => {

  const rootComponent = <${Frontend}/>
  const rootTag = document.getElementById('${projectName}')

  ${has.api ? 'hydrate' : 'render'}(rootComponent, rootTag)

})
`
