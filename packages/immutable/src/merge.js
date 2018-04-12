
// TODO should this be a part of @benzed/immutable?

// function merge (original, overlay) {
//
//   const isOriginalObject = is.plainObject(original)
//   const isOverlayObject = is.plainObject(overlay)
//
//   if (!isOriginalObject || !isOverlayObject)
//     return overlay
//
//   const result = original::copy()
//   for (const key in overlay)
//     result[key] = merge(original[key], overlay[key]::copy())
//
//   return result
//
// }
