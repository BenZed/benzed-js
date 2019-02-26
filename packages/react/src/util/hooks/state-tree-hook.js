
/******************************************************************************/
// Helper
/******************************************************************************/

const { getOwnPropertyNames, getPrototypeOf } = Object

const $$result = Symbol('interface-result')

/******************************************************************************/
// Base Class
/******************************************************************************/

class HookInterface {

  [$$result] = []

  static get interface () {
    const _interface = {}

    const Interface = this

    for (const key of getOwnPropertyNames(getPrototypeOf(Interface)))
      console.log(key)

    return _interface
  }

  use () {

  }

}

/******************************************************************************/
// Main
/******************************************************************************/

class StateTreeHook extends HookInterface {

  context () {

  }

  observe () {

  }

  path () {

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StateTreeHook.interface
