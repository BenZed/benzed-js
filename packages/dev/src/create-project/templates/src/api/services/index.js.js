
export default ({ auth, files, api, pretty, iff, backend }) => {

  const exportNames = [
    auth && 'users',
    files && 'files'
  ].filter(name => name)

  return api && pretty`
${iff(auth)`import users from './users'`}
${iff(files)`import files from './files'`}

/******************************************************************************/
// Exports
/******************************************************************************/

export {
  ${exportNames.join(',\n  ')}
}
`
}
