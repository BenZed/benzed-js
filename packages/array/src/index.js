// @flow

class Integer {

  static new (n: number) {

    return new Integer(n)
  }

  value: number

  constructor (n: number) {
    this.value = Math.round(n)
  }

}

export default Integer
