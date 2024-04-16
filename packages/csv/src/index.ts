import fs from 'fs'

import { dsvFormat } from 'd3-dsv'
import { Transform, TransformCallback } from 'stream'
import { StringDecoder } from 'string_decoder'
import { z } from 'zod'

// DSV
export const dsv = (seperator: string) => {
  const dsv = dsvFormat(seperator)

  const parse = (path: string) => dsv.parse(fs.readFileSync(path, 'utf8'))
  const parseRows = (path: string) =>
    dsv.parseRows(fs.readFileSync(path, 'utf8'))
  const format = (path: string, data: object[]) =>
    fs.writeFileSync(path, dsv.format(data))
  const formatRows = (path: string, data: string[][]) =>
    fs.writeFileSync(path, dsv.formatRows(data))

  return { parse, parseRows, format, formatRows }
}

// CSV
const csv = dsvFormat(',')

export function parse(path: string): Record<string, string>[]
export function parse<T extends z.AnyZodObject>(
  path: string,
  schema: T
): z.infer<T>[]
export function parse<T extends z.AnyZodObject>(
  path: string,
  schema?: T
): Record<string, string>[] | z.infer<T>[] {
  switch (schema) {
    case undefined:
      return csv.parse(fs.readFileSync(path, 'utf8'))
    default:
      return csv
        .parse(fs.readFileSync(path, 'utf8'))
        .map((d) => schema.parse(d))
  }
}
export function parseRows(path: string): string[][] {
  return csv.parseRows(fs.readFileSync(path, 'utf8'))
}
export function format(path: string, data: object[]): void {
  return fs.writeFileSync(path, csv.format(data))
}
export function formatRows(path: string, data: string[][]): void {
  return fs.writeFileSync(path, csv.formatRows(data))
}

// CSV-stream
class ObjectStream extends Transform {
  private _isHeader: boolean = true
  private _headers: string[] = []
  private _last: string | undefined = undefined
  private _decoder = new StringDecoder('utf8')

  constructor(opts = {}) {
    super({ objectMode: true, ...opts })
  }

  push(chunk: Record<string, any>, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding)
  }

  _transform(
    chunk: string | Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    this._last = this._last === undefined ? '' : this._last
    this._last += this._decoder.write(chunk)
    const list = this._last.split('\n')
    this._last = list.pop()
    for (let i = 0; i < list.length; i++) {
      switch (this._isHeader) {
        case true:
          this._headers = csv.parseRows(list[i])[0]
          this._isHeader = false
          break
        case false:
          this.push(this._parse(list[i]))
          break
      }
    }
    callback()
  }

  _flush(callback: TransformCallback) {
    this._last += this._decoder.end()
    if (!!this._last) {
      this.push(this._parse(this._last))
    }
    callback()
  }

  _parse(item: string): Record<string, any> {
    const row = csv.parseRows(item)[0]
    let parsed: Record<string, any> = {}
    for (let i = 0; i < this._headers.length; i++) {
      parsed[this._headers[i]] = row[i]
    }
    return parsed
  }
}

class RowStream extends Transform {
  private _last: string | undefined = undefined
  private _decoder = new StringDecoder('utf8')

  constructor(opts = {}) {
    super({ objectMode: true, ...opts })
  }

  push(chunk: string[], encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding)
  }

  _transform(
    chunk: string | Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    this._last = this._last === undefined ? '' : this._last
    this._last += this._decoder.write(chunk)
    const list = this._last.split('\n')
    this._last = list.pop()
    for (let i = 0; i < list.length; i++) {
      this.push(this._parse(list[i]))
    }
    callback()
  }

  _flush(callback: TransformCallback) {
    this._last += this._decoder.end()
    if (!!this._last) {
      this.push(this._parse(this._last))
    }
    callback()
  }

  _parse(item: string): string[] {
    const row = csv.parseRows(item)[0]
    return row
  }
}

export function fromCsv(path: string): ObjectStream
export function fromCsv(path: string, options: { headers: true }): ObjectStream
export function fromCsv(path: string, options: { headers: false }): RowStream
export function fromCsv(
  path: string,
  options: { headers: boolean } = { headers: true }
) {
  return fs
    .createReadStream(path)
    .pipe(options.headers ? new ObjectStream() : new RowStream())
}
