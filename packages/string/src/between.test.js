import { expect } from 'chai'
import between from './between'
import Test from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(between, between => {

  const str = '{one}, (two), [three], |four|, <!--five-->, <SIX/>'

  it('returns the content between and open and closing delimeter', () => {
    expect(between(str, '[', ']')).to.be.equal('[three]')
  })

  it('close delimeter is same as open delimeter if not provided', () => {
    expect(between(str, '|')).to.be.equal('|four|')
  })

  it('handles long delimiters', () => {
    expect(between(str, '<!--', '-->')).to.be.equal('<!--five-->')
  })

  it('returns null if open delimiter can\'t be found', () => {
    expect(between(str, '#')).to.equal(null)
  })

  it('returns null if close delimiter can\'t be found', () => {
    expect(between(str, '<', '!>')).to.equal(null)
  })

  it('throws if delimeters arn\'t strings', () => {
    expect(() => between(str, 10)).to.throw('delimeters must be non-empty strings')
    expect(() => between(str, '<', 10)).to.throw('delimeters must be non-empty strings')
  })

  it('throws if delimeters are empty strings', () => {
    expect(() => between(str, '')).to.throw('delimeters must be non-empty strings')
  })

})
