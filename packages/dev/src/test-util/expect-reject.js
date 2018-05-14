import { expect } from 'chai'

/******************************************************************************/
// Main
/******************************************************************************/

async function expectReject (errTypeOrString) {

  const promise = this

  let err
  try {
    await promise
  } catch (e) {
    err = e
  }

  expect(() => {
    if (err)
      throw err
  }).to.throw(errTypeOrString)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectReject
