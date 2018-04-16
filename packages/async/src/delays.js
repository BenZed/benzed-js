
export function seconds (num) {

  return milliseconds(num * 1000)

}

export function milliseconds (num) {

  return new Promise(resolve => setTimeout(resolve, num))

}
