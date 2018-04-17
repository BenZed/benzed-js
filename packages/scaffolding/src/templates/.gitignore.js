
export default ({ has }) => `
.DS_STORE

node_modules

${has.api ? 'dist' : 'lib'}
*.temp.js
`
