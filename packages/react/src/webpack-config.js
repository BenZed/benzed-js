/******************************************************************************/
// Main
/******************************************************************************/

// This is a class specifically for use in scaffolding @benzed projects

function WebpackConfig ({ name, indexFile, outputDir }) {

  if (this instanceof WebpackConfig === false)
    throw new Error('WebpackConfig must be invoked with new.')

  // this is essentially a development class, so we don't want imports used here
  // polluting the @benzed/react module for other use cases
  // const webpack = require('webpack')

  const mode = process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development'

  //
  //

  const entry = {
    [name]: indexFile
  }

  const output = {
    filename: `[name].js`,
    path: outputDir
  }

  return {

    mode,

    entry,

    output

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default WebpackConfig
