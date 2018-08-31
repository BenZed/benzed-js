import React from 'react'
import { Section, Title, Label } from '../helper'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Component = ({ children, info, ...props }) => [

  <Section key='description'>

    { info && info.name
      ? <Title>
        {info.name}
        <Label brand='keyword'>component</Label>
      </Title>
      : null
    }

    { children }

  </Section>

]

/******************************************************************************/
// Exports
/******************************************************************************/

export default Component
