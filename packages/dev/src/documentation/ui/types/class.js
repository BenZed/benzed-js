import React from 'react'
import { Section, Title, Label } from '../helper'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Class = ({ children, info, ...props }) => [

  <Section key='description'>

    { info && info.name
      ? <Title>
        {info.name}
        <Label>class</Label>
      </Title>
      : null
    }

    { children }

  </Section>

]

/******************************************************************************/
// Exports
/******************************************************************************/

export default Class
