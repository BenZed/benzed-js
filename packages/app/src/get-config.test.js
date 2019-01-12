import { expect } from 'chai'
import getConfig from './get-config'

import fs from 'fs-extra'
import path from 'path'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Setup
/******************************************************************************/

const CONFIG = path.resolve(__dirname, '../temp/config-test/get-config')

/******************************************************************************/
// Test
/******************************************************************************/

describe('getConfig', () => {

  const def = {
    port: 1234,
    number: 100,
    path: '/absolute'
  }

  const dev = {
    port: 5000
  }

  const prod = {
    port: 'PORT',
    rel: './relative',
    array: [ 'value', 0, 'NOT_CONVERTED', { port: 'PORT' } ],
    nested: { port: 'PORT' }
  }

  before(() => {

    fs.ensureDirSync(CONFIG)
    fs.removeSync(CONFIG)
    fs.ensureDirSync(CONFIG)

    fs.writeJsonSync(path.join(CONFIG, 'default.json'), def, { spaces: 4 })
    fs.writeJsonSync(path.join(CONFIG, 'development.json'), dev, { spaces: 4 })
    fs.writeJsonSync(path.join(CONFIG, 'production.json'), prod, { spaces: 4 })

  })

  it('gets config from process.env/config folder by default', () => {
    // no config folder === {}
    expect(getConfig()).to.be.deep.equal({})
  })

  it('merges configs based on process.env.NODE_ENV', () => {
    process.env.NODE_ENV = undefined
    expect(getConfig(CONFIG)).to.be.deep.equal(def)

    process.env.NODE_ENV = 'development'
    expect(getConfig(CONFIG)).to.be.deep.equal({ ...def, ...dev })
    process.env.NODE_ENV = 'test'
  })

  for (const description of [
    'upper case strings are mapped to env variables',
    'relative paths are resolved from process.cwd',
    'naked array values are not converted',
    'nested objects are converted'
  ])
    it(description, () => {
      const PORT = '5000'

      process.env.PORT = PORT
      process.env.NODE_ENV = 'production'

      expect(getConfig(CONFIG)).to.be.deep.equal({
        ...def,
        port: PORT,
        rel: path.join(process.cwd(), 'relative'),
        array: [ 'value', 0, 'NOT_CONVERTED', { port: PORT } ],
        nested: { port: PORT }
      })
      process.env.NODE_ENV = 'test'
    })

})
