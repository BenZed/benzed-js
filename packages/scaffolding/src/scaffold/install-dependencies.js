import { execSync } from 'child_process'

/******************************************************************************/
// Main
/******************************************************************************/

function installDependencies () {

  const scaffold = this

  const dev = scaffold.packages.filter(pkg => pkg.dev).map(pkg => pkg.name)
  const dep = scaffold.packages.filter(pkg => !pkg.dev).map(pkg => pkg.name)

  const cwd = scaffold.targetDir

  console.log({ dev, dep })
  if (!scaffold.flags.install)
    return

  if (dev.length > 0)
    execSync(`npm i ${dev.join(' ')} --save-dev`, { cwd })

  if (dep.length > 0)
    execSync(`npm i ${dep.join(' ')}`, { cwd })
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default installDependencies
