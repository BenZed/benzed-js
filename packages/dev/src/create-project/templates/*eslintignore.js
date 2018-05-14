
export default ({ api, pretty }) => pretty`
${api ? 'dist' : 'lib'}
node_modules

`
