const fs = require('fs')

const path = require('path')
const assert = require('node:assert')
const { describe, it } = require('node:test')

const { fromCsv } = require('../dist')

const csvPath = path.resolve(__dirname, 'fixtures/data.csv')

describe('@ocd-data/csv -> fromCsv', () => {
  it('should handle CSVs with headers', (t) => {
    const csv$ = fromCsv(csvPath)
    const expected = [
      { id: '0', value1: '1', value2: '2' },
      { id: '3', value1: '4', value2: '5' },
    ]
    let actual = []
    let counter = 0

    csv$.on('data', (d) => {
      assert.deepEqual(d, expected[counter++])
      actual.push(d)
    })
    csv$.on('close', () => {
      assert.deepEqual(actual, expected)
    })
  })

  it('should handle CSVs without headers', (t) => {
    const csv$ = fromCsv(csvPath, { headers: false })
    const expected = [
      ['id', 'value1', 'value2'],
      ['0', '1', '2'],
      ['3', '4', '5'],
    ]
    let actual = []
    let counter = 0

    csv$.on('data', (d) => {
      assert.deepEqual(d, expected[counter++])
      actual.push(d)
    })
    csv$.on('close', () => {
      assert.deepEqual(actual, expected)
    })
  })
})
