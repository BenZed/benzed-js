import isClient from './is-client'

/******************************************************************************/
// Data
/******************************************************************************/

let passive = false

/******************************************************************************/
// Setup
/******************************************************************************/

try {
  const opts = Object.defineProperty({}, 'passive', {
    get () {
      passive = true
    }
  })

  window.addEventListener('test', null, opts)
  window.removeEventListener('test', null, opts)
} catch (e) {
  passive = false
}

/******************************************************************************/
// Helper
/******************************************************************************/

const attach = isClient() && document.addEventListener

  ? (element, eventName, listener, useCapture) =>
    element.addEventListener(eventName, listener,
      passive
        ? useCapture
        : !!useCapture
    )

  : (element, eventName, listener, useCapture) =>
    useCapture
      ? throw new Error('legacy attach does not support useCapture')
      : element.attachEvent('on' + eventName, listener)

const detach = isClient() && document.addEventListener

  ? (element, eventName, listener, useCapture) =>
    element.removeEventListener(eventName, listener,
      passive
        ? useCapture
        : !!useCapture
    )

  : (element, eventName, listener) =>
    element.detachEvent('on' + eventName, listener)

/******************************************************************************/
// Main
/******************************************************************************/

function addEventListener (element, eventName, listener, useCapture) {

  if (this !== undefined) {
    useCapture = listener
    listener = eventName
    eventName = element
    element = this
  }

  return attach(element, eventName, listener, useCapture)
}

function removeEventListener (element, eventName, listener, useCapture) {

  if (this !== undefined) {
    useCapture = listener
    listener = eventName
    eventName = element
    element = this
  }

  return detach(element, eventName, listener, useCapture)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export {
  addEventListener, removeEventListener,
  addEventListener as on, removeEventListener as off
}
