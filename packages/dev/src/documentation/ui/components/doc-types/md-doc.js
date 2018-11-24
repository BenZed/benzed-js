import React from 'react'
import Markdown from 'react-markdown'
import { Code } from '../markup'

/* eslint-disable react/display-name, react/prop-types */

/******************************************************************************/
// Overrides
/******************************************************************************/

const RENDERERS = {
  code: ({ language, value }) => <Code>{value}</Code>
}

/******************************************************************************/
// Main Component
/******************************************************************************/

const MarkdownDoc = ({ children, doc, ...props }) => {

  const { data } = doc

  return <Markdown
    skipHtml
    source={data}
    renderers={RENDERERS}
  />
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default MarkdownDoc
