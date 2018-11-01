import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
import UrlType from './url-type'
import SpecificType from './specific-type'

import { expectResolve } from '@benzed/dev'

import is from 'is-explicit'
import path from 'path'

import { SCHEMA } from '../util'

const { ROOT } = SpecificType

/******************************************************************************/
// Data
/******************************************************************************/

const JS_FILE = path.join(__dirname, './url-type.js')
// const DIR = __dirname

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.skip('UrlType', () => {

  it('extends UrlType', () => {
    expect(is.subclassOf(UrlType, SpecificType))
      .to
      .be
      .equal(true)
  })

  it('has string as root type', () => {
    expect(new UrlType()[ROOT])
      .to
      .be
      .equal(String)
  })

  it('is resolved by Schema', () => {
    expect(<url/>[SCHEMA].type)
      .to
      .be
      .instanceof(UrlType)
  })

  describe('validators', () => {

    describe('sync', () => {
      it('ensures other validators are determined using sync methods')
    })

    describe('file', () => {

      it('validates that urls are files', async () => {
        const url = <url file />
        const value = await url(JS_FILE)::expectResolve()
        expect(value).to.be.equal(JS_FILE)
      })

    })

    describe('dir', () => {})

    describe('sync', () => {})

    describe('protocol', () => {})

    describe('exists', () => {})

  })
})
