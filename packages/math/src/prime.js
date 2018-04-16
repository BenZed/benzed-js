
/******************************************************************************/
// Main
/******************************************************************************/

function isPrime (value) {

  // handles #::isPrime
  if (typeof this === 'number')
    value = this

  for (let i = 2; i < value; i++)
    if (value % i === 0)
      return false

  return value > 1

}

/* What the fuck is this? */
// This is a way to circumvent the regeneratorRuntime bug when transpiling
// generator functions
const primes = (() => function * primes (...args) {

  let min, max

  // If a single argument is provided, it is the max
  if (args.length === 1) {
    ([ max = Infinity ] = args)
    min = 2

  // Otherwise we try to get the min and the max
  } else
    ([ min = 2, max = Infinity ] = args)

  for (let i = min; i < max; i++)
    if (isPrime(i))
      yield i

})()

/******************************************************************************/
// Exports
/******************************************************************************/

export { isPrime, primes }
