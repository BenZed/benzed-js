
/******************************************************************************/
// Main
/******************************************************************************/

function getDatabaseAdapter (app, name, paginate) {

  if (app.database && app.database.link) {

    const { Service: MongoService } = require('feathers-mongodb')

    const Model = app.database.link.collection(name)
    return new MongoService({
      Model,
      paginate
    })

  } else {

    const { Service: MemoryService } = require('feathers-memory')

    return new MemoryService({
      id: '_id',
      paginate
    })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDatabaseAdapter
