const path = require('path')
const test = require('tape')
const { fromCsv } = require('../index')

const csvPath = path.resolve(__dirname, 'fixtures/data.csv')

test('with with headers', (t) => {
  t.plan(2)
  const csv$ = fromCsv(csvPath)
  const expectedValues = [
    { id: '0', value1: '1', value2: '2' },
    { id: '3', value1: '4', value2: '5' },
  ]

  let counter = 0
  csv$.subscribe(
    (row) => {
      t.deepEqual(row, expectedValues[counter++])
    },
    () => {},
    t.end
  )
})

test('with without headers', (t) => {
  t.plan(3)
  const csv$ = fromCsv(csvPath, { headers: false })
  const expectedValues = [
    ['id', 'value1', 'value2'],
    ['0', '1', '2'],
    ['3', '4', '5'],
  ]

  let counter = 0
  csv$.subscribe(
    (row) => {
      t.deepEqual(row, expectedValues[counter++])
    },
    () => {},
    t.end
  )
})
