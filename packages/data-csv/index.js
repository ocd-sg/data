const fs = require('fs')
const { dsvFormat } = require('d3-dsv')

const dsv = (sep) => {
  const dsv = dsvFormat(sep)

  const parse = (path) => dsv.parse(fs.readFileSync(path, 'utf8'))
  const parseRows = (path) => dsv.parseRows(fs.readFileSync(path, 'utf8'))
  const format = (path, data) => fs.writeFileSync(path, dsv.format(data))
  const formatRows = (path, data) =>
    fs.writeFileSync(path, dsv.formatRows(data))

  return { parse, parseRows, format, formatRows }
}

const csv = dsvFormat(',')
const parse = (path) => csv.parse(fs.readFileSync(path, 'utf8'))
const parseRows = (path) => csv.parseRows(fs.readFileSync(path, 'utf8'))
const format = (path, data) => fs.writeFileSync(path, csv.format(data))
const formatRows = (path, data) => fs.writeFileSync(path, csv.formatRows(data))

const fromCsv = (path, { headers } = { headers: true }) => {
  const { Observable, combineLatest } = require('rxjs')
  const { map, filter, first, skip } = require('rxjs/operators')
  const split = require('split2')

  const stream = fs.createReadStream(path).pipe(split(csv.parseRows))
  const stream$ = Observable.create((observer) => {
    stream.on('data', observer.next.bind(observer))
    stream.on('end', observer.complete.bind(observer))
  }).pipe(
    map(([row]) => row),
    filter((d) => d.length > 0)
  )

  if (headers) {
    const transformed$ = combineLatest(
      stream$.pipe(first()),
      stream$.pipe(skip(1))
    ).pipe(
      map(([headers, row]) => {
        const transformed = {}
        for (let i = 0; i < row.length; i++) {
          transformed[headers[i]] = row[i]
        }
        return transformed
      })
    )
    return transformed$
  } else {
    return stream$
  }
}

module.exports = { dsv, parse, parseRows, format, formatRows, fromCsv }
