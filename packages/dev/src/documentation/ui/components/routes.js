import React from 'react'
import { withRouter } from 'react-router'
import { Missing } from './pages'

import { createPropTypesFor } from '@benzed/schema'
import { pop, equals } from '@benzed/immutable'

import is from 'is-explicit'
import * as doctypes from './doc-types'

/******************************************************************************/
// Helper
/******************************************************************************/

// function matchPath (nextPath, finalPath) {
//
//   for (let i = 0; i < finalPath.length; i++) {
//     const total = finalPath[i]
//     if (nextPath.length <= i)
//       break
//
//     const next = nextPath[i]
//     if (next !== total)
//       return false
//
//   }
//
//   return true
// }

const matchDocs = (path, docs, offset = 0) => {

  const pathEquals = path::equals

  const found = docs.filter(doc => pathEquals(doc.path.slice(0, doc.path.length - offset)))

  return found.length === 0 && offset < path.length
    ? matchDocs(path, docs, offset + 1)
    : found
}

// function getElementsFromDoc (docs, finalPath, currentPath = []) {
//
//   const elements = []
//
//   for (const doc of docs) {
//
//     const nextPath = currentPath::push(doc.name)
//     if (!matchPath(nextPath, finalPath))
//       continue
//
//     const Component = doc.component
//     if (Component)
//       elements.push(<Component
//         path={nextPath}
//         key={`${finalPath.join('-') + Component.name}`}
//       />)
//
//     if (doc.children)
//       elements.push(...getElementsFromDoc(doc.children, finalPath, nextPath))
//
//   }
//
//   return elements
// }

/******************************************************************************/
// Helper
/******************************************************************************/

const isNotEmpty = s => is.string(s) && s.length > 0

/******************************************************************************/
// Main Component
/******************************************************************************/

const Routes = ({ children, docs, location, ...props }) => {

  const path = location
    .pathname
    .split('/')
    .filter(isNotEmpty)

  const docsInView = matchDocs(path, docs)

  return docsInView.length === 0
    ? <Missing location={location} />
    : docsInView.map(doc => {
      const Document = doctypes[doc.type]
      if (!Document)
        return null

      return <Document key={doc.name} doc={doc} />
    })
}

/******************************************************************************/
// Prop Types
/******************************************************************************/

Routes.propTypes = createPropTypesFor(React => <proptypes>
  <any key='children' />
  <array key='packages' required >
    <object required />
  </array>
</proptypes>)

/******************************************************************************/
// Exports
/******************************************************************************/

export default withRouter(Routes)
