import { expect } from 'chai'

import validateSchema from './validate-schema'
import { PRIORITY } from './hook'
import App from '../app'
import Service from '../services'

import { createValidator } from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */
/* global describe it before after */

/******************************************************************************/
// Articles Service
/******************************************************************************/

const articlesSchema = <object>
  <string key='body' required />
  <string key='code' uppercase length={3} />
  <array key='scores' default={[0]}>
    <number required />
  </array>
</object>

class ArticlesService extends Service {

  addHooks (config, app) {

    const validate = validateSchema(articlesSchema)

    this.before({
      all: validate
    })
  }

}

/******************************************************************************/
// Test App
/******************************************************************************/

class TestApp extends App {

  services = {
    articles: ArticlesService
  }

}

/******************************************************************************/
// Helper
/******************************************************************************/

async function expectValidationError (shape) {

  const promise = this

  let err

  try {
    await promise
  } catch (e) {

    err = e

    expect(err.message)
      .to.be.equal('Validation Failed.')

    expect(err.errors)
      .to.be.deep.equal(shape)
  }

  expect(err).to.not.equal(undefined, 'No error was thrown.')

}

/******************************************************************************/
// Tests
/******************************************************************************/

describe('validate-schema hook', () => {

  it('is a hook function', () => {
    expect(validateSchema)
      .to.be
      .instanceof(Function)

    expect(validateSchema(articlesSchema)).to.have.property(PRIORITY)
  })

  let app

  before(async () => {

    const config = {
      services: {
        articles: true
      },
      port: 6525,
      rest: true
    }

    app = new TestApp(config)

    await app.initialize()

  })

  it('validates data', async () => {
    await app
      .articles
      .create({})
      ::expectValidationError({ body: 'is required.' })

    await app
      .articles
      .create({ body: 'whats this then', code: 'wtf?' })
      ::expectValidationError({ code: 'length must be equal to 3' })
  })

  it('sanitizes data', async () => {
    const doc = await app.articles.create({
      body: 'New Article 4',
      code: 'reg'
    })

    expect(doc.scores).to.be.deep.equal([0])
    expect(doc.code).to.be.equal('REG')
  })

  it('works on bulk create queries', async () => {

    const docs = await app.articles.create([
      { body: 'new article 1', code: 'aaa' },
      { body: 'new article 2', code: 'bbb' },
      { body: 'new article 3', code: 'ccc' }
    ])

    expect(docs.map(d => d.code)).to.be.deep.equal(['AAA', 'BBB', 'CCC'])

  })

  it('works on bulk patch queries', async () => {

    await app.articles.remove(null)
    await app.articles.create([
      { body: 'new article 1', code: 'aaa' },
      { body: 'new article 2', code: 'bbb' },
      { body: 'new article 3', code: 'ccc' }
    ])

    await app.articles.patch(null, { code: 'ddd' })

    const docs = await app.articles.find({})

    expect(docs.every(d => d.code === 'DDD')).to.be.equal(true)

  })

  it('$skipValidation param to skip validation', async () => {
    const doc = await app.articles.create({}, { $skipValidation: true })
    expect(doc).to.be.deep.equal({ _id: doc._id })
  })

  after(() =>
    app && app.end && app.end()
  )

})
