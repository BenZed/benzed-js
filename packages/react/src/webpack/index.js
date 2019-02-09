import 'normalize.css'

/******************************************************************************/
// Dependencies
/******************************************************************************/

const dependencies = Promise.all([
  import('react'),
  import('react-dom'),
  import('./example')
])

/******************************************************************************/
// Execute
/******************************************************************************/

void async function load () { // eslint-disable-line wrap-iife

  const [
    { default: React },
    { render },
    { default: Example }
  ] = await dependencies

  const tag = document.getElementById('benzed-react')

  const component = <Example/>

  render(component, tag)
}()
