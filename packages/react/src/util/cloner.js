import { cloneElement, Children } from 'react'

/******************************************************************************/
// Helper
/******************************************************************************/

class WhiteList {

  keys = []

  constructor (keys) {
    this.keys.push(...keys)

    return this::Cloner
  }

  apply (props) {
    const allowed = {}
    for (const key of this.keys)
      if (key in props)
        allowed[key] = props[key]

    return allowed
  }
}

class BlackList extends WhiteList {

  apply (props) {
    for (const key of this.keys)
      if (key in props)
        delete props[key]

    return props
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function Cloner ({ children, ...props }) {

  const count = Children.count(children)
  if (count === 0)
    return null

  const list = this
  if (list)
    props = list.apply(props)

  return count === 1
    ? cloneElement(children, props)
    : Children.map(children, child => cloneElement(child, props))

}

/******************************************************************************/
// Extend
/******************************************************************************/

Cloner.whitelist = (...args) => new WhiteList(args)

Cloner.blacklist = (...args) => new BlackList(args)

/******************************************************************************/
// Canned
/******************************************************************************/

const CssCloner = Cloner.whitelist('className', 'style')

/******************************************************************************/
// Exports
/******************************************************************************/

export default Cloner

export { CssCloner }
