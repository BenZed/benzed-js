import args from 'args'
import validateOptions from './validate-options'

/******************************************************************************/
// Main
/******************************************************************************/

function createProject (argv, options) {

  const flags = args
    .option('dir', 'directory where project will be generated', process.cwd())
    // .option('install', 'should dependencies be installed', true)
    .parse(argv)

  // args creates the same flag 3 times with single letter alternatives,
  // which I don't need
  for (const key in flags)
    if (key.length === 1)
      delete flags[key]

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProject
