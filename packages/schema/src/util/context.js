import { copy } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

class Context {
  constructor (data, args = [], path = []) {
    this.data = data
    this.args = args
    this.path = copy(path)
  }

  push (key) {
    const context = new Context(this.data, this.args, this.path)

    context.path.push(key)

    return context
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Context
