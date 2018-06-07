import nestInComponent from './nest-in-component'

import { expect } from 'chai'
import { Test } from '@benzed/dev'

import { PropTypeSchema, string } from '@benzed/schema'

import React from 'react'
import renderer from 'react-test-renderer'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(nestInComponent, nestInComponent => {

  let tree, Nested
  before(() => {
    const Parent = ({ children, ...props }) =>
      <div {...props}>{children}</div>

    Parent.propTypes = new PropTypeSchema({
      foo: string
    })

    const Child = ({ children, ...props }) =>
      <span {...props}>{children}</span>

    Nested = nestInComponent(Child, Parent)

    const test = renderer.create(
      <Nested foo='bar' cake='day'>
        Hello World!
      </Nested>
    )

    tree = test.toTree()
  })

  it('returns a component', () => {
    expect(() => React.createElement(Nested)).to.not.throw(Error)
  })

  it('places props defined in Parent.propTypes into Parent component', () => {

    const { children, ...parentProps } = tree.rendered.props

    expect(parentProps).to.be.deep.equal({ foo: 'bar' })
  })

  it('places the remaining props into Child component', () => {
    const { children } = tree.rendered.props
    const { children: childChildren, ...childProps } = children.props

    expect(childProps).to.be.deep.equal({ cake: 'day' })
  })

  it('places children in child component', () => {
    const { children } = tree.rendered.props
    const { children: childChildren } = children.props

    expect(childChildren).to.be.deep.equal('Hello World!')
  })

  it('throws if no propTypes are defined in parent', () => {
    const BadParent = props => <main {...props}/>

    expect(() => nestInComponent('div', BadParent)).to.throw('propTypes must be defined in parent')
  })

})
