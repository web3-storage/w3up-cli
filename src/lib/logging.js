import fs from 'fs'

/**
 * Log an error to the error file.
 * @async
 * @param {string} action - The action that triggered the error.
 * @param {Error|any} error - The error
 * @returns {Promise<void>}
 */
export async function logToFile(action, error) {
  await fs.promises.appendFile(
    'w3up-failure.log',
    `${new Date().toISOString()} [${action}]: ${error?.toString()}\n`
  )
}
