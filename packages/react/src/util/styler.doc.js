import React from 'react' // eslint-disable-line no-unused-vars

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'Styler'
}

/******************************************************************************/
// Doc
/******************************************************************************/

const Styler = ({ Types, Detail }) =>
  <Types.Class info={INFO}>
    <p>
      The Styler class is a syntax shortening class that creates style functions
      for styled components.
    </p>

    <p>
      You wouldn't instance a Styler directly. Instead, you'd create an interface
      with one:
    </p>

    <Detail.Script>{`
      import { Styler } from '@benzed/react'
      import styled from 'styled-components'

      const $ = Styler.createInterface()

      const RedDiv = styled.div\`
        background-color: \${$.prop('color')};
      \`
      // <RedDiv color='red' /> will have a red background
      `}</Detail.Script>

    <p>
      The interface contains the same methods and properties that the class does,
      and using those properties creates new instances of stylers:
    </p>

    <Detail.Script>{`
      const
    `}</Detail.Script>

  </Types.Class>

const $ = () => null

/******************************************************************************/
// Exports
/******************************************************************************/

export { Styler, $ }
