import React, { useRef, useState, useContext, createContext } from 'react'

import styled from 'styled-components'

import { first, adjacent } from '@benzed/array'

import { FormStateTree, Form, FormPresets } from '../../form'

import { Flex } from '../../layout'

import { BadRequest } from '@feathersjs/errors'

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
      age: 34
    },
    async submit (...args) {
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new BadRequest({
        errors: { name: 'Fuck you' }
      })
    }
  })

  return <div {...props}>

    <h1>Building a Modular Form Component</h1>

    <Form form={form}>
      <Flex.Column >
        <Form.String path='name' placeholder='name' />
        <Form.String path='age' placeholder='age' />
      </Flex.Column>
    </Form>

    <BasicForm form={form}>
      <Flex.Column >
        <BasicForm.String path='name' placeholder='name' />
        <BasicForm.String path='age' placeholder='age' />
      </Flex.Column>
    </BasicForm>

  </div>
})`
  padding: 1em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Main
