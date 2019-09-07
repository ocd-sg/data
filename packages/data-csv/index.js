const fs = require('fs')
const { dsvFormat } = require('d3-dsv')

const dsv = (sep) => {
  const dsv = dsvFormat(sep)

  const parse = (path) => dsv.parse(fs.readFileSync(path, 'utf8'))
  const parseRows = (path) => dsv.parseRows(fs.readFileSync(path, 'utf8'))
  const format = (path, data) => fs.writeFileSync(path, dsv.format(data))
  const formatRows = (path, data) => fs.writeFileSync(path, dsv.formatRows(data))

  return { parse, parseRows, format, formatRows }
}

const csv = dsvFormat(',')
const parse = (path) => csv.parse(fs.readFileSync(path, 'utf8'))
const parseRows = (path) => csv.parseRows(fs.readFileSync(path, 'utf8'))
const format = (path, data) => fs.writeFileSync(path, csv.format(data))
const formatRows = (path, data) => fs.writeFileSync(path, csv.formatRows(data))

module.exports = { dsv, parse, parseRows, format, formatRows }
