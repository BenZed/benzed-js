import { expect } from 'chai'
import argsToRangeCompare from './args-to-range-compare'
import { inspect } from 'util'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('argsToRangeCompare()', () => {

  it('is a function', () => {
    expect(argsToRangeCompare).to.be.instanceof(Function)
  })

  it('expects an array', () => {
    expect(() => argsToRangeCompare('>=', 5)).to.throw('expects an array')
  })

  describe('returns a comparer', () => {
    let compare
    before(() => {
      compare = argsToRangeCompare(['>=', 5])
    })
    it('is a function', () => {
      expect(compare).to.be.instanceof(Function)
    })
    it('returns value if within range', () => {
      expect(compare(5)).to.be.equal(5)
    })
    it('returns error if not within range', () => {
      expect(compare(4)).to.have.property('message', 'must be equal to or greater than 5')
    })

  })

  const OPS = [ '>', '>=', '==', '<=', '<' ] // not in-between ops

  describe('configuration', () => {

    describe('min, max, value numbers', () => {

      describe('explicit config', () => {

        it('value must not be defined for <=> operator', () => {
          expect(() => argsToRangeCompare([{ operator: '<=>', value: 100 }]))
            .to.throw('value must not be defined for <=>')
        })
        describe(`value must be defined for ${OPS} operators`, () => {
          for (const operator of OPS)
            it(`${operator} value: undefined`, () => {
              expect(() => argsToRangeCompare([{ operator }]))
                .to.throw('value must be defined for ' + operator)
            })
        })
        describe(`min and max must not be defined for ${OPS} operators`, () => {
          for (const operator of OPS)
            for (const [min, max] of [[undefined, 10], [10, undefined], [5, 5]])
              it(`${operator} min: ${min} max: ${max} `, () => {
                expect(() => argsToRangeCompare([{ operator, min, max }]))
                  .to.throw('value must be defined for ' + operator)
              })
        })
        describe('min and max must be defined for between operators', () => {
          for (const [min, max] of [[undefined, 10], [10, undefined], [undefined, undefined]])
            it(`<=> min: ${min} max: ${max} `, () => {
              expect(() => argsToRangeCompare([{ operator: '<=>', min, max }]))
                .to.throw('min and max must be defined for <=>')
            })
        })
        it('min must be lower than max', () => {
          expect(() => argsToRangeCompare([{ operator: '<=>', min: 1, max: 0 }]))
            .to.throw('min must be below max')
        })
      })

      describe('implicit config', () => {
        describe('min and max is inferred for <=> operator', () => {
          for (const [min, max] of [[0, 1], [1, 0], [-1, 1]])
            it(`<=> ${min} ${max}`, () => {
              expect(() => argsToRangeCompare(['<=>', min, max]))
                .to.not.throw(Error)
            })
        })
        describe(`value is inferred for ${OPS} operator`, () => {
          for (const operator of OPS)
            it(`${operator} 0`, () => {
              expect(() => argsToRangeCompare([operator, 0]))
                .to.not.throw(Error)
            })
        })
        describe(`at least one number is required for ${OPS} operators`, () => {
          for (const operator of OPS)
            it(`${operator} undefined`, () => {
              expect(() => argsToRangeCompare([operator]))
                .to.throw('needs one number to compare')
            })
        })
        describe('at least two numbers for min and max are required for between operators', () => {
          for (const value of [ undefined, 0, -1, 1 ])
            it(`<=> ${value}`, () => {
              expect(() => argsToRangeCompare([ '<=>', value ]))
                .to.throw('needs two numbers to compare')
            })
        })
      })
    })

    describe('operators string', () => {
      describe('must be one of >= > <=> < <=', () => {
        for (const operator of [...OPS, '<=>'])
          it(`${operator} is valid`, () => {
            expect(() => argsToRangeCompare([{ operator }]))
              .to.not.throw(`${operator} is not a valid operator.`)
          })
        for (const badValue of [ '=<', '*', null, 0, -100, Symbol('ace'), {}, [] ])
          it(`${inspect(badValue)} is not valid`, () => {
            expect(() => argsToRangeCompare([{ operator: badValue }]))
              .to.throw(`${String(badValue)} is not a valid operator`)
          })
      })
      it('defaults to <=>', () => {

      })
    })

    describe('err string or function', () => {
      it('if function receives difference description and values, output is used for error message', () => {
        let _diff
        let _values
        const func = (diff, ...values) => {
          _diff = diff
          _values = values

          return '2 to 8 only'
        }
        const between2and8 = argsToRangeCompare([2, 8, func])

        expect(between2and8(1)).to.have.property('message', '2 to 8 only')
        expect(_diff).to.equal('between')
        expect(_values).to.deep.equal([ 2, 8 ])
      })
      it('if string, it is used for error message', () => {
        const lessThan5 = argsToRangeCompare(['<=', 5, 'no more than 5'])
        expect(lessThan5(6)).to.have.property('message', 'no more than 5')
      })
    })

  })

})
