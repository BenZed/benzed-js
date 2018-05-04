import { copy } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

class Context {
  constructor (data, args = [], path = []) {
    this.data = data
    this.args = args
    this.path = copy(path)
    this.throw = true
  }

  push (key) {
    const context = new Context(this.data, this.args, this.path)

    context.path.push(key)

    return context
  }

  safe () {
    const context = new Context(this.data, this.args, this.path)
    context.throw = false

    return context
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Context
