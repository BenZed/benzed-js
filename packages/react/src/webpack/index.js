import 'normalize.css'
import './assets/benzed-react.css'

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('./example'),
  import('@benzed/immutable')
])

/******************************************************************************/
// Execute
/******************************************************************************/

window.addEventListener('load', async () => {

  const [
    React,
    { render },
    { default: Example },
    { unique }
  ] = await dependencies

  const arr = [ 0, 0, 1, 2, 3, 0, 10, 4, 5, 2, 1 ]::unique()

  const tag = document.getElementById('benzed-react')
  const component = <Example arr={arr} />

  render(component, tag)
})
