import styled, { css } from 'styled-components'

import Highlight from 'react-highlight'
import React from 'react'

import { $ } from '../../../theme'

/******************************************************************************/
// Atom One Dark Theme
/******************************************************************************/

const THEMED = css`
  &.hljs {
    display: block;
    overflow-x: auto;
    color: ${$.theme.codefg};
    background: ${$.theme.codebg};
  }

  .hljs-comment,
  .hljs-quote {
    color: ${$.theme.brand.comment};
    font-style: italic;
  }

  .hljs-doctag,
  .hljs-keyword,
  .hljs-formula {
    color: ${$.theme.brand.keyword};
  }

  .hljs-section,
  .hljs-name,
  .hljs-selector-tag,
  .hljs-deletion,
  .hljs-subst {
    color: ${$.theme.brand.substring};
  }

  .hljs-literal {
    color: ${$.theme.brand.literal};
  }

  .hljs-string,
  .hljs-regexp,
  .hljs-addition,
  .hljs-attribute,
  .hljs-meta-string {
    color: ${$.theme.brand.string};
  }

  .hljs-built_in,
  .hljs-class .hljs-title {
    color: ${$.theme.brand.builtin};
  }

  .hljs-attr,
  .hljs-variable,
  .hljs-template-variable,
  .hljs-type,
  .hljs-selector-class,
  .hljs-selector-attr,
  .hljs-selector-pseudo,
  .hljs-number {
    color: ${$.theme.brand.type};
  }

  .hljs-symbol,
  .hljs-bullet,
  .hljs-link,
  .hljs-meta,
  .hljs-selector-id,
  .hljs-title {
    color: ${$.theme.brand.link};
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: bold;
  }

  .hljs-link {
    text-decoration: underline;
  }
`

/******************************************************************************/
// Helper
/******************************************************************************/

function countSpaces (line) {
  let spaces = 0
  for (let i = 0; i < line.length; i++)
    if (line.charAt(i) === ' ')
      spaces++
    else
      break

  return spaces
}

function nicify (code) {

  let spaces

  return code.split('\n')
    .filter((line, i, arr) => (i > 0 && i < arr.length) || line.trim().length > 0)
    .map((link, i, arr) => {
      if (spaces === undefined)
        spaces = countSpaces(arr[i])

      return link.substr(spaces)
    })
    .join('\n')

}

/******************************************************************************/
// Main Component
/******************************************************************************/

const Code = styled(props => {

  const { className, children, ...rest } = props

  return <Highlight {...rest} className={className + ' javascript'}>
    {children}
  </Highlight>
})`
  box-sizing: content-box;

  margin: 0.5em 0em 0.5em 0em;
  padding: 1em;
  border-radius: 1em;
  max-width: 40em;
  white-space: pre-wrap;

  display: block;

  > span {
    padding: 0;
  }

  ${THEMED};
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Code
