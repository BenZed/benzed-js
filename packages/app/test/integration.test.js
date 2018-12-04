import { expect } from 'chai'
import { Test, expectResolve, expectReject } from '@benzed/dev'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import declareEntity from '../src/declare-entity'

/* @jsx JSX */
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const create = {
  schema: func => func(Schema.createValidator),
  app: func => func(declareEntity)
}

describe('test app', () => {

  const userSchema = create.schema(JSX => <object plain strict>
    <string key='_id' />
    <string key='name' />
    <string key='email' required length={['>', 0]} />
    <string key='password' required />
  </object>)

  Test.Api(create.app(JSX => <app>

    <express />

    <authentication />

    <service name='users'>

      <paginate default={10} max={100} />

      <hooks before all>
        <authenticate strategy='jwt' />

        <password-validate length={8} />
        <password-hash />

        <schema-validate schema={userSchema} />
        <dates-write />
      </hooks>

      <hooks after all>
        <password-protect />
      </hooks>

    </service>

    <hooks before all>
      {ctx => { ctx.app.appLevelHooksCalled = true }}
    </hooks>

    <express-error />

  </app>), state => {

    before(() =>
      state.api.service('users').create([
        {
          name: 'james',
          email: 'admin@email.com',
          password: 'password',
          passwordConfirm: 'password'
        }
      ])
    )

    it('app level hooks are applies', () => {
      expect(state.api.appLevelHooksCalled).to.be.equal(true)
      expect('_hooksToAdd' in state.api).to.be.equal(false)
    })

    it('starts up on correct port', () => {
      state.address.includes(state.api.get('port'))
    })

    it('is a rest app', () => {
      expect(state.api.rest).to.be.instanceof(Object)
    })

    it('requires authentication', async () => {
      await state.client.service('users').find({})::expectReject('No auth token')
    })

    it('users cant see passwords', async () => {
      await state.client.authenticate({
        strategy: 'local',
        email: 'admin@email.com',
        password: 'password'
      })::expectResolve()

      const users = await state.client.service('users').find({})::expectResolve()

      expect(users.data.every(user => 'password' in user)).to.be.equal(false)
    })

    it('applies user schema', async () => {

      await state
        .api
        .service('users')
        .create({
          email: ''
        })::expectReject('Validation Failed.')
    })
  })
})
