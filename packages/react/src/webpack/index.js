import 'normalize.css'

const dependencies = Promise.all([
  import('@benzed/react'),
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
    { StoreProvider, task }
  ] = await dependencies

  class DummyClientStore extends ClientStore {

    constructor (config) {
      super(config)
      this.set('host', this.config.hosts[0])
    }

    @task
    login (email, password) {
      if (password === 'password')
        this.set('userId', 'some-user-id')
      else {
        this.set('userId', null)
        this.status(new Error('Bad Password.'))
      }

      if (password === 'password')
        setTimeout(() => {
          this.set('userId', null)
          this.status(new Error('Kicked off.'))
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
