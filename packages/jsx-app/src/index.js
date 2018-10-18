// this is going to be another exploration in jsx syntax, this time using
// it to declare feathers-apps

const App = { // eslint-disable-line no-unused-vars

  declare (type, props, ...children) {
    const obj = {
      type,
      ...props
    }

    for (const { type, ...data } of children)
      obj[type] = data

    return obj
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default App
