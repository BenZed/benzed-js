
export const devDependencies = [
  'chai',
  'mocha',
  'babel-register',
  'babel-polyfill'
]

export default () => `
--require babel-register
--require babel-polyfill
--bail
test/**/*.test.js
`
