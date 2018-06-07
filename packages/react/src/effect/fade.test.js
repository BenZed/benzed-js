import { expect } from 'chai'
import Fade from './fade'
import renderer from 'react-test-renderer'
import { Test } from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Fade', () => {

  Test.propTypes(Fade, expectError => {

    describe('visibility', () => {
      it('must be hidden, hiding, showing or shown')
    })

  })
})
