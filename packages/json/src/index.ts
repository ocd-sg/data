import fs from 'fs'

export const parse = <T>(path: string): T =>
  JSON.parse(fs.readFileSync(path, 'utf8'))

export const format = (path: string, data: unknown) =>
  fs.writeFileSync(path, JSON.stringify(data))
