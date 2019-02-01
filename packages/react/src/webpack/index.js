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

void async function load () { // eslint-disable-line wrap-iife

  const [
    React,
    { render },
    { default: Example }
  ] = await dependencies

  const tag = document.getElementById('benzed-react')

  const component = <Example/>

  render(component, tag)
}()
