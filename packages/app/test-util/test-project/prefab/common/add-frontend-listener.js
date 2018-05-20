import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

/******************************************************************************/
// Main
/******************************************************************************/

function addFrontEndListener (FrontEnd, props = {}) {

  const win = this || window
  if (!win || !win.addEventListener)
    return

  const start = Date.now()

  win.loaded = new Promise((resolve, reject) => {
    win.addEventListener('load', () => {
      try {

        const mainTag = document.getElementsByTagName('main')[0]
        const dataTags = document.querySelectorAll('[type=\'application/json\']')

        const json = dataTags.length > 0
          ? dataTags[0].textContent.replace('<![CDATA[', '').replace(']]>', '')
          : null
        const serverProps = json && JSON.parse(json)

        hydrate(
          <BrowserRouter>
            <FrontEnd {...props} {...serverProps} />
          </BrowserRouter>,
          mainTag
        )

        resolve(Date.now() - start)

      } catch (err) {
        reject(err)
      }
    })
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default addFrontEndListener
