import 'normalize.css'

import PACKAGES from '../docs'

/******************************************************************************/
// Dynamic Dependencies
/******************************************************************************/

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('react-router-dom'),
  import('../ui/root')
])

/******************************************************************************/
// Helper
/******************************************************************************/

function getServerProps () {

  let props
  try {

    const serverPropsTag = document.getElementById('benzed-documentation-server-props')

    props = JSON.parse(serverPropsTag.textContent)

    serverPropsTag.textContent = ''

  } catch (err) {
    // it could be that the server sent bad data, but generally any failure
    // will simply mean no data has been sent
  }

  // make double sure we're sending back an object
  return props !== null && typeof props === 'object'
    ? props
    : null

}

function getMainTag () {
  return document.getElementById('benzed-documentation')
}

/******************************************************************************/
// Execute
/******************************************************************************/

dependencies.then((
  [
    { default: React },
    { hydrate },
    { BrowserRouter },
    { default: Website }
  ]
) => {

  const props = getServerProps()
  const main = getMainTag()

  const packagesWithDocs = PACKAGES.filter(pkg => pkg.doc.length > 0)

  const element = <BrowserRouter>
    <Website {...props}
      packages={packagesWithDocs} />
  </BrowserRouter>

  hydrate(element, main)
})
