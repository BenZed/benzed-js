import { expect } from 'chai'
import UiStateTree from './ui-state-tree'
import storage from '../../util/storage'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('UiStateTree', () => {

  let ui
  for (const store of [ 'local', 'session' ]) {

    before(() => {
      storage[store].setItem('@benzed-foo', 'bar')
      ui = new UiStateTree()
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
      describe('config.prefix', () => {
        it('determines the key prefix of ui keys in local storage', () => {
          const ui = new UiStateTree({ prefix: 'super' })

          ui[store].setItem('man', 'clark-kent')
          expect(storage[store].getItem('super-man'))
            .to.be.equal('clark-kent')
        })
      })
    })
  }
})
