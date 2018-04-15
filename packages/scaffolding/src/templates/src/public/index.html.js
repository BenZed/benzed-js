export default ({ has, projectName }) => has.ui && `<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'>
    <title>${projectName.toUpperCase()}</title>
  </head>
  <body>
    <main id='${projectName}'/>
  </body>
</html>
`
