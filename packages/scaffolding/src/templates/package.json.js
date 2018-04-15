export function devDependencies ({ has }) {
  return [
    'mocha',
    'babel-cli',
    'eslint',
    has.api && 'nodemon',
    has.ui && 'webpack-dev-server'
  ]
}

export default ({ projectName, backend, json, has, iff }) => {

  const build = has.api ? 'dist' : 'lib'

  return json({
    name: projectName,
    version: '0.0.1',
    scripts: {
      'test': 'mocha --opts .mocha.opts',
      'test:dev': 'npm run test -- --watch',
      'build': `rm -rf ${build}; mkdir ${build}; babel src --out-dir ${build} --copy-files`,
      'build:dev': 'npm run build -- --watch',
      'serve':     iff(has.api)`NODE_ENV=production node ${build}/scripts/serve.js`,
      'serve:dev': iff(has.api)`NODE_ENV=development nodemon --watch ${build}/${backend}
        ${build}/scripts/serve.js`,
      'webpack':     iff(has.ui)`NODE_ENV=production webpack --config config/webpack.js`,
      'webpack:dev': iff(has.ui)`NODE_ENV=development webpack-dev-server --config config/webpack.js`,
      'release:patch': iff(!has.api)`npm version patch && npm publish`,
      'release:minor': iff(!has.api)`npm version minor && npm publish`,
      'release:major': iff(!has.api)`npm version major && npm publish`,
      'prepublishOnly': iff(!has.api)`npm run lint && npm run test && npm run build`,
      'lint': 'eslint src --fix'
    },
    keywords: [],
    author: 'BenZed',
    license: 'ISC',
    description: 'created by BenZeds scaffolder'
  }, 2)
}
