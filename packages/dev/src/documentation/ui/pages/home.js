import React from 'react'
import Page from './page'

import { PropTypeSchema, object, required } from '@benzed/schema'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Home = ({ children, location, ...props }) =>
  <Page>
    <h2>
      {location.pathname}
    </h2>
  </Page>

/******************************************************************************/
// Prop Types
/******************************************************************************/

Home.propTypes = new PropTypeSchema({
  location: object(required)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default Home
