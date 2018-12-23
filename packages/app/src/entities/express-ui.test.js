import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

import fs from 'fs-extra'
import path from 'path'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Helper
/******************************************************************************/

const createHtml = (config = {}) => {
  const { name = 'index.html', mutate } = config

  let data = `<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
    <meta name='viewport'
      content='width=device-width,
      initial-scale=1,
      maximum-scale=1,
      user-scalable=no'
      >
    <title>Test Html</title>
  </head>
  <body>
    <main id='entry'/>
  </body>
</html>`

  if (mutate)
    data = mutate(data)

  const dir = path.join(process.cwd(), 'temp', 'html')
  fs.ensureDirSync(dir)

  const url = path.join(dir, name)
  fs.writeFileSync(url, data, 'utf-8')

  return url
}

const expectBadlyFormedHtml = (doWithContents, doWithExpect) => {

  const url = createHtml({
    name: 'bad.html',
    mutate: doWithContents
  })

  return doWithExpect(
    expect(() => <express-ui html={url} />)
  )
}

/******************************************************************************/
// Test
/******************************************************************************/

describe.only('<express-ui/>', () => {

  const goodHtml = createHtml()

  it('can be created with jsx', () => {
    const ui = <express-ui html={goodHtml} />

    expect(ui[$$entity]).to.have.property('type', 'express-ui')
  })

  describe('entity function', () => {

    it('requires express', () => {
      expect(<app>
        <express-ui html={goodHtml} />
      </app>)
        .to
        .throw('cannot use express ui without express enabled')

      expect(<app>
        <express/>
        <express-ui html={goodHtml} />
      </app>)
        .to
        .not
        .throw('cannot use express ui without express enabled')
    })

    describe('html prop', () => {
      it('is required', () => {
        expect(() =>
          <express-ui />)
          .to
          .throw('express-ui.html is required')
      })
      it('must point to an existing html file', () => {
        expect(() =>
          <express-ui html={goodHtml.replace('index.html', 'missing.html')} />)
          .to
          .throw('express-ui.html must exist on the file system')
      })
      describe('if combined with an component prop', () => {

        it('throws if index.html doesn\'t have main tag', () => {
          expectBadlyFormedHtml(
            contents => contents.replace(/main/g, 'div'),
            to => to.throw(`main tag is not self closing or could not be found`)
          )
        })

        it('throws if main tag is missing id', () => {
          expectBadlyFormedHtml(
            contents => contents.replace('id=\'entry\'', ''),
            to => to.throw(`main tag does not have an id attribute`)
          )
        })

        it('throws if id is empty', () => {
          expectBadlyFormedHtml(
            contents => contents.replace('id=\'entry\'', 'id=\'\''),
            to => to.throw(`id is empty`)
          )
        })

        it('throws if missing head tag', () => {
          expectBadlyFormedHtml(
            contents => contents.replace('</head>', ''),
            to => to.throw(`missing </head> tag`)
          )
        })

      })
    })

    it('throws if not given an app as input')
    it('throws if result cannot be turned into memory service')

  })

})
