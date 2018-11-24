import 'normalize.css'

/******************************************************************************/
// Dynamic Dependencies
/******************************************************************************/

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('react-router-dom'),
  import('@benzed/react'),
  import('../ui'),
  import('../theme')
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

dependencies.then(([

  { default: React },
  { hydrate },
  { BrowserRouter },
  { GlobalStyle, ClientStateTree, ServiceStateTree },
  { default: View },
  { theme }

]) => {

  const props = getServerProps()
  const main = getMainTag()

  const client = new ClientStateTree({
    hosts: `http://localhost:5100`,
    provider: 'rest'
  })

  const docs = new ServiceStateTree({
    serviceName: 'docs',
    client
  })

  client.connect()

  const element = <BrowserRouter>
    <GlobalStyle theme={theme}>
      <View {...props}
        title='Global Mechanic'
        docs={docs}
      />
    </GlobalStyle>
  </BrowserRouter>

  hydrate(element, main)
})
