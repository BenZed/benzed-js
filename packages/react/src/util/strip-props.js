
/******************************************************************************/
// Main
/******************************************************************************/

const stripProps = (Component, props) => {

  const componentProps = {}

  for (const key in props)
    if (key in Component.propTypes) {
      componentProps[key] = props[key]
      delete props[key]
    }

  return componentProps
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default stripProps
