import { expect } from 'chai'

/******************************************************************************/
// Main
/******************************************************************************/

async function expectResolve (...args) {

  const [ next ] = args

  const promise = this

  let err
  let result
  try {
    result = await promise
  } catch (e) {
    err = e
  }

  expect(() => {
    if (err)
      throw err
  }).to.not.throw()

  return args.length === 0
    ? result
    : typeof next === 'function'

      ? next(expect(result))
      : typeof next === 'object' && next !== null

        ? expect(result).to.be.deep.equal(next)
        : expect(result).to.be.equal(next)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectResolve
