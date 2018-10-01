import is from 'is-explicit'
import fs from 'fs-extra'
import path from 'path'

/******************************************************************************/
// Data
/******************************************************************************/

// TODO this should in the file-service config
const ONE_YEAR = 60 * 60 * 24 * 365 // sec min hour day
const PARTIAL_STATUS_CODE = 206

/******************************************************************************/
// Helper
/******************************************************************************/

const getServeAttributes = (req, res, doc) => {

  const isGet = res.hook?.method === 'get'
  if (!isGet)
    return null

  // the disposition setting is inferred from the serve attribute
  let { serve: disposition, name } = req.query

  // as far as I understand rest, all attributes come through as a string, but
  // i'm not 100% so, here we are
  if (!is.string(disposition))
    disposition = `${disposition}`

  if (disposition === 'true' || disposition === '1' || disposition === 'download')
    disposition = 'attachment'

  // if the disposition setting cannot be cast to a valid value, no file will be
  // served.
  if (disposition !== 'attachment' && disposition !== 'inline')
    return null

  // If a custom name wasn't requested, use the name saved in database
  if (!name)
    name = doc.name

  return { disposition, name }

}

const parseRange = (req, size) => {

  const { range } = req.headers

  let [ start, end ] = is.string(range) // eslint-disable-line prefer-const
    ? range.replace(/bytes=/, '')
      .split('-')
      .map(word => parseInt(word, 10))
    : []

  if (!isFinite(start))
    return null

  if (!isFinite(end))
    end = size - 1

  return { start, end }
}

const getUrl = (doc, config) => {

  const { local } = config.storage

  const id = `${doc._id}`

  return path.join(local, id)
  // TODO implement
}

/******************************************************************************/
// Main
/******************************************************************************/

function serveFile (req, res, next) {

  // res.data is the document stored in the database
  const doc = res.data

  const serve = getServeAttributes(req, res, doc)

  // if the serve attributes are null, this is not a download request
  if (serve === null)
    return next()

  // this function should be bound to the file service config
  const config = this

  try {

    const range = parseRange(req, doc.size)
    const length = range
      ? (range.end - range.start) + 1
      : doc.size

    if (range) {
      res.status(PARTIAL_STATUS_CODE)
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${doc.size}`)
      res.setHeader('Accept-Ranges', 'bytes')
    }

    const { disposition, name } = serve
    const { type } = doc

    res.setHeader('Content-Length', length)
    res.setHeader('Content-Type', type)
    res.setHeader('Content-Disposition', `${disposition}; filename=${name}`)
    res.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}`)

    const url = getUrl(doc, config)

    fs.createReadStream(url, range)
      .pipe(res)

  } catch (err) {
    next(err)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default serveFile
