import React from 'react'
import { render } from 'react-dom'

/******************************************************************************/
// Main
/******************************************************************************/

function addFrontEndListener (FrontEnd, props = {}) {

  const win = this || window
  if (win && win.addEventListener)
    win.addEventListener('load', () => {

      const mainTag = document.getElementsByTagName('main')[0]
      const dataTags = document.querySelectorAll('[type="application/json"]')

      const json = dataTags.length > 0
        ? dataTags[0].textContent
        : null

      const serverProps = json
        ? JSON.parse(json)
        : {}

      render(
        <FrontEnd {...props} {...serverProps} />,
        mainTag
      )

    })
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default addFrontEndListener
