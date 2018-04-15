
export default ({ has }) => `
${has.api ? 'dist' : 'lib'}
node_modules
`
