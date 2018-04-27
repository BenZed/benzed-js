
export default ({ ui, api, pretty }) => pretty`
.DS_STORE
node_modules

*.temp*
*-old*
${ui && (api ? 'dist/webpack' : 'lib/webpack')}
${api ? 'dist' : 'lib'}
`
