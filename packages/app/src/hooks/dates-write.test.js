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

describe('dates-write hook', () => {

  it('can be declared with jsx', () => {
    const hook = <dates-write />

    expect(hook.name).to.be.equal('dates-write')
  })

  describe('placement', () => {

    let hook
    before(() => {
      hook = <dates-write />
    })

    for (const [ type, method ] of typesAndMethods()) {
      const shouldRun = type === 'before' && [ 'patch', 'create' ].includes(method)
      const context = {
        type,
        method,
        id: 0,
        service: {
          get () {
            return { created: new Date() }
          }
        }
      }

      it(`'${type}', '${method}' should ${shouldRun ? 'run' : 'skip'}`, () => {

        const ctx = { ...context, data: {} }
        hook(ctx)

        const didRun = 'isMulti' in ctx
        expect(didRun).to.be.equal(shouldRun)
      })
    }

  })

  it('adds timestamps to created docs', () => {

    const hook = <dates-write />
    const ctx = {
      id: 0,
      method: 'create',
      type: 'before',
      data: {}
    }

    hook(ctx)

    expect(ctx.data.created).to.be.instanceof(Date)
    expect(ctx.data.updated).to.be.instanceof(Date)
  })

  it('adds timestamps to patched docs', () => {
    const ctx = {
      id: 0,
      method: 'patch',
      type: 'before',
      data: {}
    }

    const hook = <dates-write />

    hook(ctx)
    expect(ctx.data.updated).to.be.instanceof(Date)
  })

  it('does not overwrite user provided fields', () => {

    const hook = <dates-write />
    const ctx = {
      method: 'create',
      type: 'before',
      data: {
        updated: true,
        created: true
      }
    }

    hook(ctx)
    expect(ctx.data.updated).to.be.equal(true)
    expect(ctx.data.created).to.be.equal(true)

  })

  it('works on multi queries', () => {
    const hook = <dates-write />
    const ctx = {
      method: 'create',
      type: 'before',
      data: [{}, {}]
    }

    hook(ctx)
    expect(ctx.data.every(d => 'created' in d)).to.be.equal(true)
  })

  it('created field name can be customized')

  it('updated field name can be customized')

})
