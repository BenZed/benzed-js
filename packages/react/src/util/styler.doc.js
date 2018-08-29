import React from 'react' // eslint-disable-line no-unused-vars

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'Styler',
  methods: [

  ],
  classMethods: [

  ]
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
      for one:
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
      $.prop('hidden')
      // equivalent to
      new Styler().prop('hidden')
    `}</Detail.Script>

    <p>
      Interfaces can be created with a theme, which will add theme getters to
      the resulting Styler.
    </p>
    <Detail.Script>{`
      const theme = {
        bg: 'black',
        fg: 'white'
      }

      const $ = Styler.createInterface(theme)

      const Section = styled.section\`
        background-color: \${$.theme.bg};
        color: \${$.theme.fg};
      \`

      // <Section /> will have be theme colored
    `}</Detail.Script>

    <p></p>

  </Types.Class>

// const $ = () => null

/******************************************************************************/
// Exports
/******************************************************************************/

export { Styler
  // , $
}
