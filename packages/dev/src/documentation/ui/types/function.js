import React from 'react'
import styled from 'styled-components'

import { Title, Description, Label } from '../helper'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Function = ({ children, info, ...props }) => [

  info && info.name
    ? <Title key='title'>
      {info.name}
      <Label>function</Label>
    </Title>
    : null,

  <Description key='description'>
    {children}
  </Description>

]

/******************************************************************************/
// Exports
/******************************************************************************/

export default Function
