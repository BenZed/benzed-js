import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validate
/******************************************************************************/

const validateOptions = <object key='mongod' plain >

  <string key='username' />
  <string key='password' />
  <string key='database' />
  <string key='dbpath' />

  <array key='hosts' length={[ '>=', 1 ]} cast>
    <string
      format={[/([A-z]|[0-9]|-|\.)+:\d+/, 'must be a url.']}
      required
    />
  </array>

</object>

/******************************************************************************/
// Helper
/******************************************************************************/

async function tryConnect (arg) {

  const {
    uri,
    database,
    createProcessOnFail = true,
    dbpath
  } = arg

  const app = this

  try {

    const { MongoClient } = require('mongodb')

    const client = await MongoClient.connect(uri, { useNewUrlParser: true })

    app.mongodb.client = client
    app.mongodb.database = client.db(database)

  } catch (err) {

    const isRefusedError = err.message && err.message.includes('ECONNREFUSED')
    if (isRefusedError && createProcessOnFail) {

      await app::createMongoProcess({
        uri,
        database,
        dbpath
      })

      await app::tryConnect({
        uri,
        database,
        createProcessOnFail: false,
        dbpath
      })

    } else throw Error(`could not connect to database ${uri}`)
  }
}

function handleDatabaseProcessError (result) {
  const reject = this

  const message = result === 100
    ? `local mongodb process could not start`
    : `local mongodb process could not be created: ${result}`

  reject(new Error(message))
}

function isLocalHost (hosts) {
  return hosts.length === 1 && /^localhost:/i.test(hosts[0])
}

function createMongoProcess ({ uri, dbpath }) {
  const app = this

  const { spawn } = require('child_process')

  const port = app.get('mongodb').hosts[0].replace('localhost:', '')

  app.log`local mongodb process being created on port ${port}`

  return new Promise((resolve, reject) => {

    const onError = reject::handleDatabaseProcessError
    const onWait = msg => {
      if (msg.includes(`waiting for connections on port ${port}`)) {
        app.mongodb.process.stdout.removeListener('data', onWait)
        resolve(app.mongodb.process)
      }
    }

    app.mongodb.process = spawn('mongod', [
      '--port', port,
      '--quiet',
      '--dbpath', dbpath
    ])

    app.mongodb.process.on('exit', onError)
    app.mongodb.process.on('error', onError)
    app.mongodb.process.stdout.on('data', onWait)

  })
}

async function disconnect () {
  const app = this

  await app.mongodb?.client.close()
}

/******************************************************************************/
// Main
/******************************************************************************/

const mongod = props => {

  const { children, ...options } = props

  return async app => {

    const {
      username, password, database, hosts, dbpath
    } = validateOptions(options)

    app.set('mongodb', options)

    app.mongodb = {
      client: null,
      database: null,
      process: null
    }

    const auth = username && password
      ? `${username}:${password}@`
      : ''

    const host = hosts.join(',')
    const uri = `mongodb://${auth}${host}/${database}`

    try {
      await app::tryConnect({
        uri,
        dbpath,
        database,
        createProcessOnFail: isLocalHost(hosts)
      })
    } catch (err) {
      throw err
    }

    app.on('end', app::disconnect)

    app.log`connected to mongodb at ${uri}`
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default mongod
