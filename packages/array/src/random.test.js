import { expect } from 'chai'
import { Test } from '@benzed/dev'
import random from './random'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(random, random => {

  it('gives a random element in an array')

})
