import React from 'react'
import styled from 'styled-components'

import { FormStateTree, Form, FormPresets } from '../../form'
import { Flex } from '../../layout'

import { BadRequest } from '@feathersjs/errors'

import { copy } from '@benzed/immutable'

import schema from './schema'

/******************************************************************************/
// Presets
/******************************************************************************/

const BasicForm = FormPresets.Basic

/******************************************************************************/
// Main Component
/******************************************************************************/


const Main = styled(props => {

  const form = new FormStateTree({
    data: {
      name: 'Ben',
      age: 34,
      gender: 'male'
    },
    submit (...args) {
      return this.current::copy()
    }
  })

  return <Flex.Column {...props}>

    <h1>Building a Modular Form Component</h1>

    <BasicForm form={form} >
      {}
    </BasicForm>

  </Flex.Column>

})`
  padding: 1em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Main
