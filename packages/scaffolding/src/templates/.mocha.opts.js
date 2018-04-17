
export const devDependencies = [
  'chai',
  'mocha',
  'babel-register',
  'babel-polyfill'
]

export default () => `
--require babel-register
--require babel-polyfill
--require ./test
--bail
src/**/*.test.js
`
