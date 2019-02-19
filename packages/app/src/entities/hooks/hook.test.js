import { expect } from 'chai'
import declareEntity from '../../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Test
/******************************************************************************/

describe('<hook/>', () => {

  it('can be created with jsx', () => {
    const hook = <hook>{() => {}}</hook>

    expect(hook[$$entity]).to.have.property('type', 'hook')
  })

  it('can be used to quickly declare hooks', () => {

    // eslint-disable-next-line no-unused-vars
    const Disallow = ({ provider }) =>
      <hook>{ctx => {
        if (ctx.params.provider === provider)
          throw new Error(
            `'${provider}' provider may not use '${ctx.method}' method`
          )
      }}</hook>

    const fakeContext = {
      params: {
        provider: 'rest'
      },
      method: 'test'
    }

    const disallowRest = <Disallow provider='rest' />

    expect(() => disallowRest(fakeContext))
      .to
      .throw(`'rest' provider may not use 'test' method`)

  })

  it('requires a function as a child', () => {
    expect(() => <hook/>).to.throw('must have a hook function')
  })

  it('exactly one child function', () => {
    expect(() => <hook>{() => {}}{() => {}}</hook>)
      .to.throw('only one hook function')
  })

  for (const prop of [ 'types', 'methods' ])
    describe(`${prop} prop limits hook usage to specific ${prop}`, () => {

      const options = {
        types: [ 'before', 'after', 'error' ],
        methods: [ 'find', 'get', 'update', 'patch', 'create', 'remove' ]
      }[prop]

      for (const hookOption of options)
        for (const contextValue of options)
          it(`'${hookOption}' on hook and '${contextValue}' in context should` +
            `${hookOption === contextValue ? ' not' : ''}` +
            ` throw`, () => {
            const dummyHook = <hook {...{ [prop]: hookOption }}>{() => {}}</hook>

            let err = null
            try {
              dummyHook({
                params: { provider: 'rest' },
                [prop.replace('s', '')]: contextValue
              })
            } catch (e) {
              err = e
            }

            if (hookOption === contextValue)
              expect(err).to.be.equal(null)
            else
              expect(err).to.be.instanceof(Error)
          })

    })

  describe(`provider prop limits hook usage to specific provider`, () => {

    for (const hookProvider of [ 'socketio', 'rest', 'internal', 'external' ])
      for (const ctxProvider of [ 'socketio', 'rest', undefined ]) {

        const outcome = ctxProvider === hookProvider ||
          (ctxProvider && hookProvider === 'external') ||
          (!ctxProvider && hookProvider === 'internal')

        it(`'${hookProvider}' on hook and '${ctxProvider}' on context should` +
          `${outcome ? ' not' : ''} run hook`, () => {

          let ran = false

          const dummyHook = <hook provider={hookProvider}>{() => { ran = true }}</hook>

          dummyHook({
            params: {
              provider: ctxProvider
            }
          })

          expect(ran).to.be.equal(!!outcome)

        })

      }
  })

  describe('hook context is decorated', () => {

    describe('multi property', () => {

      for (const [ method, result ] of [ [ 'find', true ], [ 'get', false ] ])
        it(`is ${result} when calling ${method} method`, () => {
          let multi

          const hook = <hook>{ctx => { multi = ctx.multi }}</hook>
          hook({ method })

          expect(multi).to.be.equal(result)
        })

      for (const data of [ { name: '0' }, [ { name: '1' }, { name: '2' } ] ]) {
        const result = Array.isArray(data)
        it(`is ${result} when calling create with ${result
          ? 'array of data'
          : 'non-array of data'}`
        , () => {
          let multi

          const hook = <hook>{ctx => { multi = ctx.multi }}</hook>
          hook({ method: 'create', data })

          expect(multi).to.be.equal(Array.isArray(data))
        })
      }

      for (const method of [ 'patch', 'remove' ])
        for (const id of [ 0, null ]) {
          const result = id == null
          it(`is ${result} when calling ${method} with${result
            ? 'out'
            : ''} a id`, () => {
            let multi

            const hook = <hook>{ctx => { multi = ctx.multi }}</hook>
            hook({ method, id })

            expect(multi).to.be.equal(result)
          })
        }
    })
  })
})
