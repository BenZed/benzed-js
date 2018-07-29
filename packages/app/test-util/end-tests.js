
/* global describe it */

describe('MongoClient.connect hang workaround', () => {
  it('For some fuck-off reason, calling MongoClient.connect prevents a process\n' +
  '      exiting if the connect fails. If I\'m doing it wrong, I dont understand how.\n' +
  '      This tests simply ends the test environment by calling process.exit()\n' +
  '      Since it\'s the last test, it\'ll only be called if all other tests passed.',
  () => {
    setTimeout(() => process.ext(0), 500)
  })
})
