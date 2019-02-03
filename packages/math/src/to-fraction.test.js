import { xpect } from 'chai'
import toFraction from './to-fraction'
import Test from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod.only(toFraction, toFraction => {

  describe('returns fractions', () => {

    it('handles NaN', () =>
      expect(() => toFraction(NaN)).to.throw('cannot convert NaN to a fraction')
    )

    for (let numerator = 1; numerator < 100; numerator++)
      for (let denominator = 1; denominator < 100; denominator++)
        if ((numerator / denominator).toString().length > 7)
          continue
        else
          it(`${numerator}/${denominator} == ${toFraction(numerator / denominator)}`, () => {
            const fraction = toFraction(numerator / denominator)
            expect(fraction.valueOf()).to.be.equal(numerator / denominator)
          })

  })

})
