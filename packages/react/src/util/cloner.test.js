import { expect } from 'chai'
import renderer from 'react-test-renderer'
import Cloner, { CssCloner } from './cloner'
import React from 'react'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Cloner', () => {

  it('is a component', () => {
    expect(() => renderer.create(<Cloner><div/></Cloner>)).to.not.throw(Error)
  })

  it('passes props to children', () => {

    const test = renderer.create(
      <Cloner foo='bar' cake='day'>
        <div/>
      </Cloner>
    )

    expect(test.toTree().rendered.props).to.deep.equal({ foo: 'bar', cake: 'day' })

  })

  it('works with multiple children', () => {

    const test = renderer.create(
      <Cloner foo='bar' cake='day'>
        <div/>
        <div/>
        <div/>
      </Cloner>
    )

    for (const child of test.toTree().rendered)
      expect(child.props).to.deep.equal({ foo: 'bar', cake: 'day' })

  })

  it('works with no children', () => {

    expect(() => renderer.create(
      <Cloner foo='bar' cake='day' />
    )).to.not.throw(Error)

  })

})

describe('Cloner.whitelist', () => {
  it('returns a cloner that only passes props with keys matching arguments', () => {
    const FooCakeCloner = Cloner.whitelist('foo', 'cake')
    const test = renderer.create(
      <FooCakeCloner foo='bar' cake='day' bad='>:('>
        <div/>
      </FooCakeCloner>
    )

    expect(test.toTree().rendered.props)
      .to.be.deep.equal({ foo: 'bar', cake: 'day' })
  })
})

describe('Cloner.blacklist', () => {
  it('returns a cloner that does not pass props with keys matching arguments', () => {
    const NotBadCloner = Cloner.blacklist('bad')
    const test = renderer.create(
      <NotBadCloner foo='bar' cake='day' bad='>:('>
        <div/>
      </NotBadCloner>
    )

    expect(test.toTree().rendered.props)
      .to.be.deep.equal({ foo: 'bar', cake: 'day' })
  })
})

describe('CssCloner', () => {
  it('canned cloner only returns props "style" and "className"', () => {
    const test = renderer.create(
      <CssCloner style='fake-style' className='fake-class-name' unrelated='prop'>
        <div/>
      </CssCloner>
    )

    expect(test.toTree().rendered.props)
      .to.be.deep.equal({ style: 'fake-style', className: 'fake-class-name' })
  })
})
