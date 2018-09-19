import React from 'react'
import { withRouter } from 'react-router'
import { Missing } from '../pages'

import { PropTypeSchema, arrayOf, object, any } from '@benzed/schema'
import { push } from '@benzed/immutable'

import is from 'is-explicit'

import * as Types from '../types'
import * as Detail from '../detail'
import { Label } from '../helper'

/******************************************************************************/
// Helper
/******************************************************************************/

function matchPath (nextPath, finalPath) {

  for (let i = 0; i < finalPath.length; i++) {
    const total = finalPath[i]
    if (nextPath.length <= i)
      break

    const next = nextPath[i]
    if (next !== total)
      return false

  }

  return true
}

function getElementsFromDoc (docs, finalPath, currentPath = []) {

  const elements = []

  for (const doc of docs) {

    const nextPath = currentPath::push(doc.name)
    if (!matchPath(nextPath, finalPath))
      continue

    const Component = doc.component
    if (Component)
      elements.push(<Component
        Types={Types}
        Detail={Detail}
        Label={Label}
        path={nextPath}
        key={`${finalPath.join('-') + Component.name}`}
      />)

    if (doc.children)
      elements.push(...getElementsFromDoc(doc.children, finalPath, nextPath))

  }

  return elements
}

/******************************************************************************/
// Helper
/******************************************************************************/

const isNotEmpty = s => is.string(s) && s.length > 0

/******************************************************************************/
// Main Component
/******************************************************************************/

const Routes = ({ children, docs, location, ...props }) => {

  docs = docs.length > 1
    ? docs
    : docs[0].children

  const path = location
    .pathname
    .split('/')
    .filter(isNotEmpty)

  const elements = getElementsFromDoc(docs, path)

  return elements.length === 0
    ? <Missing location={location} />
    : elements

}

/******************************************************************************/
// Prop Types
/******************************************************************************/

Routes.propTypes = new PropTypeSchema({
  children: any,
  packages: arrayOf(object)
})

/******************************************************************************/
// Exports
/******************************************************************************/

export default withRouter(Routes)
