
/******************************************************************************/
// Helper
/******************************************************************************/

async function tryConnect ({
  uri,
  database,
  createProcessOnFail = true,
  dbpath
}) {

  const app = this

  const { MongoClient } = require('mongodb')

  try {

    const client = await MongoClient.connect(uri, { useNewUrlParser: true })
    app.database.link = client.db(database)

  } catch (err) {

    const isRefusedError = err.message.includes('ECONNREFUSED')
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

function handleDatabaseProcessError (reject) {

  const app = this

  return result => {

    if (app.feathers.listener)
      app.end()

    const message = result === 100
      ? `local mongodb process could not start`
      : `local mongodb process could not be created: ${result}`

    reject(new Error(message))
  }
}

function isLocalHost (hosts) {
  return hosts.length === 1 && /^localhost:/i.test(hosts[0])
}

function createMongoProcess ({ uri, database, dbpath }) {
  const app = this

  const { spawn } = require('child_process')

  const port = app.get('mongodb').hosts[0].replace('localhost:', '')

  app.log`local mongodb process being created on port ${port}`

  return new Promise((resolve, reject) => {

    const onError = app::handleDatabaseProcessError(reject)

    app.database.process = spawn('mongod', [
      '--port', port,
      '--quiet',
      '--dbpath', dbpath // TODO add the ability customize data path location to config
    ])

    app.database.process.on('exit', onError)
    app.database.process.on('error', onError)
    app.database.process.stdout.on('data', msg => {
      if (msg.includes(`waiting for connections on port ${port}`))
        resolve(app.database.process)
    })

  })
}

/******************************************************************************/
// Main
/******************************************************************************/

async function connectToDatabase () {

  const app = this

  const { feathers } = app

  const mongodb = feathers.get('mongodb')
  if (!mongodb)
    return

  app.database = {
    link: null,
    process: null
  }

  const { username, password, database, hosts, dbpath } = mongodb

  const auth = username && password
    ? `${username}:${password}@`
    : ''

  const host = hosts.join(',')

  const uri = `mongodb://${auth}${host}/${database}`

  try {
    await app::tryConnect({
      uri,
      database,
      dbpath,
      createProcessOnFail: isLocalHost(hosts)
    })
  } catch (err) {

    throw err
  }

  if (app.database.process)
    app.log`local mongodb process created successfully`

  app.log`connected to mongodb at ${uri}`
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default connectToDatabase
