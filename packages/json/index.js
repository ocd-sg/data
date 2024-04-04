const fs = require('fs')

const parse = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))

const format = (path, data) => fs.writeFileSync(path, JSON.stringify(data))

module.exports = { parse, format }
