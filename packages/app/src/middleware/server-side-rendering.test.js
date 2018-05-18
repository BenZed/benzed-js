import { expect } from 'chai'
import serverSideRender from './server-side-rendering'
import path from 'path'
import fs from 'fs-extra'
import { createElement } from 'react'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// DATA
/******************************************************************************/

const TEST_TEMP_DIR = path.resolve(__dirname, '../../test/temp')

/******************************************************************************/
// Helper
/******************************************************************************/

class FakeResponse {

  body = []
  head = []

  ended = false

  write (...args) {
    this.body.push(args)
  }

  writeHead (...args) {
    this.head.push(args)
  }

  end () {
    this.ended = true
  }

}

class FakeRequest {

  constructor (url) {
    this.url = url
  }

}

function testIndexHtml (id = 'test-project') {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
  </head>
  <body>
    <main id='${id}'/>
  </body>
</html>
`
}

function createTestIndexHtml (id, subPath = '') {
  const url = path.join(TEST_TEMP_DIR + subPath ? subPath : '', 'index.html')

  if (fs.existsSync(url))
    fs.removeSync(url)

  fs.ensureFileSync(url)

  fs.writeFileSync(url, testIndexHtml(id))

  return path.dirname(url)
}

function fakeCall (url) {
  const middleware = this

  const req = new FakeRequest(url)
  const res = new FakeResponse()

  middleware(req, res)

  return res
}

const TestComponent = ({ ssr }) => {

  return createElement(
    'h1',
    {},
    [ `rendered ${ssr ? 'server-side' : 'locally'} ` ]
  )
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe.only('serverSideRender()', () => {

  it('is a function', () => {
    expect(serverSideRender).to.be.instanceof(Function)
  })

  it('writes a react component into an html template to reponse', () => {
    const publicDir = createTestIndexHtml()
    const ssr = serverSideRender(publicDir, TestComponent)
  })

  describe('public dir first arg', () => {

    it('throws if public dir does not have an index.html')
    it('throws if index.html doesn\'t have main tag')
    it('throws if main tag is missing id')
    it('throws if id is empty')
    it('throws if missing head tag')

  })

  describe('component second arg', () => {
    it('must be a function')
    it('expected to be a react component')
  })

})
