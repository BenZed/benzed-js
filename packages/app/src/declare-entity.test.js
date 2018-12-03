import { expect } from 'chai'

import declareEntity from './declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from './util'

// import is from 'is-explicit'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope, react/prop-types */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('declareEntity', () => {

  it('returns an entity', () => {
    const express = <express />

    expect(express)
      .to
      .have
      .property($$entity)

    expect(express[$$entity])
      .to
      .have
      .property('type', 'express')
  })

  it('must be a valid type', () => {
    expect(() => <invalid />).to.throw('\'invalid\' not a recognized entity.')
  })

  it('can also be a function', () => {

    const CustomMiddleware = props => {

      return app => {
        app.hello = 'world'
      }
    }

    const app = (<app>
      <CustomMiddleware />
    </app>)()

    expect(app).to.have.property('hello', 'world')
  })

  it('entities cannot be nested', () => {

    const UserService = <service name='users' />

    expect(() => <app>
      <express/>
      <UserService />
    </app>).to.throw('cannot declare nested entities, place it inside a function.')

  })

  it('entities can be turned into components', () => {

    const UserService = ({ strategy = 'jwt' }) => <service name='users'>
      <hooks before all>
        <authenticate strategy={strategy} />
      </hooks>
    </service>

    const app = <app>
      <express/>
      <UserService strategy='jwt local' />
    </app>

  })

})
