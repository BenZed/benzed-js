import React from 'react'
import { Route } from 'react-router'
import styled from 'styled-components'

/******************************************************************************/
// Style
/******************************************************************************/

const PageLayout = styled.section`
  font-family: Helvetica;
  display: flex;
  flex-direction: column;
`

const Error = styled.div.attrs({
  id: 'server-error',
  children: ({ error }) => [
    <h3>{error.message}</h3>
  ]
})`
  color: red;
`

/******************************************************************************/
// Page
/******************************************************************************/

const Page = ({ hydrated, error, history, status, ...props }) => [

  <h1 key='location'>current page: {history.location.pathname}</h1>,
  <h2 key='renderer'>{hydrated ? 'serverside' : 'clientside'}</h2>,
  status
    ? <h4 key='data' id='serialized-data'>{status}</h4>
    : null,
  error
    ? <Error error={error} key='error' />
    : null
]

/******************************************************************************/
// Main Component
/******************************************************************************/

const AnyRoute = ({ children, ...props }) =>
  <PageLayout>
    <Route render={route => <Page {...props} {...route}/> } />
  </PageLayout>

/******************************************************************************/
// Exports
/******************************************************************************/

export default AnyRoute
