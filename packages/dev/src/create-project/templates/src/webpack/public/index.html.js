
export default ({ ui, name, pretty }) => ui && `<!DOCTYPE html>
<html>

  <head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'>
    <title>${name}</title>
  </head>

  <body>
    <main id='${name}'/>
  </body>

</html>`
