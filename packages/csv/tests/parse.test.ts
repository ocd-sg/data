import { describe, expect, test } from 'bun:test'
import path from 'path'

import { z } from 'zod'
import { parse } from '../src'

const fixturePath = path.resolve(__dirname, 'fixtures/data.csv')

describe('@ocd-data/csv -> parse', () => {
  test('should handle typed parsing', () => {
    const schema = z.object({
      id: z.coerce.number(),
      value1: z.coerce.number(),
      value2: z.coerce.number(),
    })
    const expected = [
      { id: 0, value1: 1, value2: 2 },
      { id: 3, value1: 4, value2: 5 },
    ]
    const actual = parse(fixturePath, schema)
    expect(actual).toEqual(expected)
  })

  test('should handle untyped parsing', () => {
    const expected = [
      { id: '0', value1: '1', value2: '2' },
      { id: '3', value1: '4', value2: '5' },
    ]
    const actual = parse(fixturePath)
    expect(actual).toEqual(expected)
  })
})
