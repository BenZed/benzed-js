import args from 'args'

/******************************************************************************/
// Main
/******************************************************************************/

function parseArgs (input) {
  const options = args

    // .option('name', 'name of the project')
    .option('dir', 'directory where project will be generated', process.cwd())

    .option('api', 'should this project use an api')
    .option('socketio', 'should this api use a socket.io provider')

    .option('rest', 'should this api use a rest provider')
    .option('auth', 'should this api use user authentication')

    .option('files', 'should this api have a files service')
    .option('ui', 'should this project have a ui')
    .option('routing', 'should this project have routing')

    .parse(input)

  options.name = args.sub[0]

  // args creates the same flag 3 times with single letter alternatives,
  // which I don't need
  for (const key in options)
    if (key.length === 1)
      delete options[key]

  return options
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default parseArgs
