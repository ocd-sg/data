import { describe, expect, test } from 'bun:test'
import path from 'path'

import { fromCsv } from '../src'

const fixturePath = path.resolve(__dirname, 'fixtures/data.csv')

describe('@ocd-data/csv -> fromCsv', () => {
  test('should handle CSVs with headers', () => {
    const csv$ = fromCsv(fixturePath)
    const expected = [
      { id: '0', value1: '1', value2: '2' },
      { id: '3', value1: '4', value2: '5' },
    ]
    let actual: Record<string, string>[] = []
    let counter = 0

    csv$.on('data', (d) => {
      expect(d).toEqual(expected[counter++])
      actual.push(d)
    })
    csv$.on('close', () => {
      expect(actual).toEqual(expected)
    })
  })

  test('should handle CSVs without headers', () => {
    const csv$ = fromCsv(fixturePath, { headers: false })
    const expected = [
      ['id', 'value1', 'value2'],
      ['0', '1', '2'],
      ['3', '4', '5'],
    ]
    let actual: string[][] = []
    let counter = 0

    csv$.on('data', (d) => {
      expect(d).toEqual(expected[counter++])
      actual.push(d)
    })
    csv$.on('close', () => {
      expect(actual).toEqual(expected)
    })
  })
})
