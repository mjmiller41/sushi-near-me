import fs from 'fs/promises'
import util from 'util'
// import { Console } from 'node:console'

const filename = `_backend/logs/places.log`
// Create a write stream, 'a' flag for appending
// const logFile = fs.createWriteStream(filename, { flags: 'a' })
// Create a new console instance
// const log = new Console({ stdout: logFile, stderr: logFile })
// log.log(`LOG: ${date} ${util.format(message)}`)

export const log = async (filename, message) => {
  const date = new Date().toISOString().replace(/T/, ' ')
  await fs.appendFile(filename, `LOG: ${date}\n${util.format(message)}\n\n`)
  console.log(`Appended place to ${filename} successfully.`)
}

// const originalError = console.error
// console.error = message => {
//   const date = new Date().toISOString().replace(/T/, ' ')
//   originalError.call(console, '\x1b[31m%s\x1b[0m', message)
//   logger.error(`ERROR: ${date} ${util.format(message)}`)
// }

// // Redefine console.log
// const originalLog = console.log
// console.log = message => {
//   const date = new Date().toISOString().replace(/T/, ' ')
//   originalLog.call(console, message)
//   logger.log(util.format(message))
// }
