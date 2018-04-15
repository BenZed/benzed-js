
export default ({ has, projectName, iff }) => !has.api && `
/******************************************************************************/
// ${projectName} entry point
/******************************************************************************/

// this project has no api, so it's assumed to be a library.

${iff(has.ui)`// It can serve a react ui for testing purposes.`}

`
