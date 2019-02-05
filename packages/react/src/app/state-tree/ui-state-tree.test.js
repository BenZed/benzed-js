import { expect } from 'chai'
import UiStateTree from './ui-state-tree'
import storage from '../../util/storage'
import { createMemoryHistory } from 'history'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('UiStateTree', () => {

  let ui
  for (const store of [ 'local', 'session' ]) {

    before(() => {
      storage[store].setItem('@benzed-foo', 'bar')
      ui = new UiStateTree({
        history: createMemoryHistory()
      })
    })

    describe(`${store} storage`, () => {

      it(`allows ${store} storage to be manipulated in state`, () => {
        ui[store].setItem('cake', 'town')

        expect(storage[store].getItem('@benzed-cake'))
          .to.be.equal('town')

        expect(ui[store].getItem('cake'))
          .to.be.equal('town')
      })

      it('existing keys are populated on to data', () => {
        expect(ui[store].getItem('foo'))
          .to.be.equal('bar')
      })

      describe('has all localStorage api methods', () => {
        for (const key of [ 'setItem', 'getItem', 'removeItem', 'clear', 'key' ])
          it(key, () => {
            expect(ui[store][key]).to.be.instanceof(Function)
          })
      })
    })

    describe(`${store} config`, () => {
      describe('config.history', () => {

        let ui
        let history
        before(() => {
          history = createMemoryHistory()
          ui = new UiStateTree({ history })
        })

        it('syncs location state to history state', () => {
          const path = '/navigated/to/a/place'
          history.push(path)
          expect(ui.location.pathname).to.be.equal(path)
        })

        it('serialized search as query', () => {
          const path = `/some-place?foo=bar&cake=town`
          history.push(path)
          expect(ui.location.query)
            .to
            .be
            .deep
            .equal({ foo: 'bar', cake: 'town' })
        })

        it('is required', () => {
          expect(() => new UiStateTree({})).to.throw('config.history is required')
        })

      })
      describe('config.prefix', () => {
        it('determines the key prefix of ui keys in local storage', () => {
          const ui = new UiStateTree({
            prefix: 'super',
            history: createMemoryHistory()
          })

          ui[store].setItem('man', 'clark-kent')
          expect(storage[store].getItem('super-man'))
            .to.be.equal('clark-kent')
        })
      })
    })
  }
})
