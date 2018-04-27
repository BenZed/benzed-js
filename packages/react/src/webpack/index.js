import 'normalize.css'
import './assets/benzed-react.css'

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('./example')
])

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', async () => {

  const [
    React,
    { render },
    { default: Example }
  ] = await dependencies

  const tag = document.getElementById('benzed-react')
  const component = <Example/>

  render(component, tag)
})
