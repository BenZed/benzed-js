import 'normalize.css'
import './assets/benzed-react.css'

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('./example'),
  import('../app'),
  import('../store')
])

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', async () => {

  const [
    React,
    { render },
    { default: Example },
    { ClientStore },
    { StoreProvider }
  ] = await dependencies

  class DummyClientStore extends ClientStore {

    constructor (config) {
      super(config)
      this.set('host', this.config.hosts[0])
    }

    login = (email, password) => {
      if (password === 'password')
        this.set(['auth'], { userId: 'some-user-id', error: null })
      else
        this.set(['auth'], { userId: null, error: 'Bad password.' })

      if (password === 'password')
        setTimeout(() => {
          this.set(['auth'], { userId: null, error: 'Kicked off.' })
        }, 3000)
    }

  }

  const client = new DummyClientStore({
    hosts: 'http://localhost:4000',
    provider: 'rest',
    auth: true
  })

  const tag = document.getElementById('benzed-react')

  const component = <StoreProvider client={client}>
    <Example/>
  </StoreProvider>

  render(component, tag)
})
