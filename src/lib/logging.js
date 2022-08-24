import fs from 'fs'

export async function logToFile(action, error) {
  await fs.promises.appendFile(
    'w3up-failure.log',
    `${new Date().toISOString()} [${action}]: ${error.toString()}\n`
  )
}
