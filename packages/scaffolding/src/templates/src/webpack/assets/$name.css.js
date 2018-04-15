
export default ({ has, iff, projectName }) => has.ui && `
#${projectName} {
  ${iff(has.api)`font-family: Helvetica;`}
}`
