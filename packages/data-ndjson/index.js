const fs = require('fs')

const parse = (path) => fs.readFileSync(path, 'utf8')
  .split('\n')
  .map((d) => d.trim())
  .filter((d) => d)
  .map((d) => JSON.parse(d))
const format = (path, data) => fs.writeFileSync(
  path,
  data
    .filter((d) => d)
    .map((d) => JSON.stringify(d))
    .join('\n')
)

const parseRow = (row) => JSON.parse(row)
const formatRow = (row) => JSON.stringify(row).concat('\n')

const fromNDJson = (path) => {
  const { Observable } = require('rxjs')
  const { map } = require('rxjs/operator')
  const split = require('split2')

  const stream = fs.createReadStream(path)
    .pipe(split(parseRow))

  return Observable.create((observer) => {
    stream.on('data', observer.next.bind(observer))
    stream.on('end', observer.complete.bind(observer))
  })
}

module.exports = { parse, format, parseRow, formatRow, fromNDJson }
