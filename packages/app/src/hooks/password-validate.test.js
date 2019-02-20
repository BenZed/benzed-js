import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars

// @jsx declareEntity

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

function * typesAndMethods () {
  for (const type of ['before', 'after', 'error'])
    for (const method of ['find', 'get', 'patch', 'update', 'remove', 'create'])
      yield [ type, method ]
}

describe('password-validate hook', () => {

  it('can be declared with jsx', () => {
    const hook = <password-validate />

    expect(hook.name).to.be.equal('password-validate')
  })

  describe('placement', () => {

    let hook
    before(() => {
      hook = <password-validate />
    })

    for (const [ type, method ] of typesAndMethods()) {
      const shouldRun = type === 'before' && [ 'update', 'patch', 'create' ].includes(method)
      const context = {
        type,
        method,
        id: 0
      }

      it(`'${type}', '${method}' should ${shouldRun ? 'run' : 'skip'}`, () => {

        const ctx = { ...context, data: {} }
        hook(ctx)

        const didRun = 'isMulti' in ctx
        expect(didRun).to.be.equal(shouldRun)
      })
    }
  })

  describe('validation', () => {

    let hook, runHook
    before(() => {
      hook = <password-validate />
      runHook = data => {
        try {
          return hook({
            type: 'before',
            method: 'create',
            data
          })
        } catch (e) {
          return e
        }
      }
    })

    it('requires a password to be of a preconfigured length', () => {
      expect(
        runHook({
          password:'ace'
        })
      ).to
        .have
        .property('message', 'Password invalid.')
    })

    it('requires passwordConfirm field to match', () => {
      expect(
        runHook({
          password: 'treehugger',
          passwordConfirm: 'environmentalist'
        })
      ).to
        .have
        .property('message', 'Password mismatch.')
    })

    it('works on multi queries', () => {
      expect(runHook([
        {
          password: 'hey-mon!',
          passwordConfirm: 'hey-mon!'
        }, {
          password: 'hey-mon!',
          passwordConfirm: 'hey-mon!'
        }, {
          password: 'hey-mon!',
          passwordConfirm: 'hey-mon!'
        }
      ]))
        .to.not
        .have.property('message')
    })

    it('does not throw password field is falsy (unprovided)', () => {
      expect(runHook({ password: null }))
        .to.not.have.property('message')
    })

    it('password field is removed if falsy', () => {
      expect(runHook({ password: null }).data)
        .to.not.have.property('password')
    })

    it('passwordConfirm field is always removed', () => {
      expect(runHook({
        passwordConfirm: null
      }).data)
        .to.not.have.property('passwordConfirm')

      expect(runHook({
        passwordConfirm: '12345678',
        password: '12345678'
      }).data)
        .to.not.have.property('passwordConfirm')
    })

  })

  describe('options', () => {
    it('length is configurable')
    it('optionally requires uppercase characters')
    it('optionally requires symbolic characters')
    it('optionally requires numeric characters')
  })

})
