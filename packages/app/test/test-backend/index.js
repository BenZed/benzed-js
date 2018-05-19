import App from 'src/app'

/******************************************************************************/
// Main
/******************************************************************************/

class TestBackend extends App {

  constructor (override = {}) {
    const config = {
      ...override,
      rest: true,
      port: 6789
    }

    super(config)
  }

  RouteComponent = () =>
    <div>
      TEMPORARY UI COMPONENT
    </div>

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default TestBackend
