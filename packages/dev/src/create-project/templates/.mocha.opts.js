export default ({ pretty }) => pretty`
--require babel-register
--require babel-polyfill
--require ./test
--bail
src/**/*.test.js
`
