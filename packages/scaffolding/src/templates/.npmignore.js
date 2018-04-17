
export default ({ has, iff }) => has.api && `
*
${has.api ? 'dist' : 'lib'}/**/*
${iff(has.ui)`dist/webpack`}
*.test.js
`
