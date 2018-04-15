
export default ({ has, Backend, backend }) => has.api && `

import ${Backend} from '../${backend}'

/******************************************************************************/
// Run
/******************************************************************************/

// eslint-disable-next-line wrap-iife
void async function serve () {

  const ${backend} = new ${Backend}()

  try {

    ${backend}.log.clear()

    await ${backend}.initialize()
    await ${backend}.start()

    ${backend}.log\`listening on port \${${backend}.get('port')}\`

  } catch (err) {

    ${backend}.log.error\`\${err}\`

    if (${backend}.listener)
      ${backend}.listener.close()

    process.exit(1)
  }

}()
`
