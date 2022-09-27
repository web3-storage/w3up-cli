import Inquirer from 'inquirer'
import ora from 'ora'

import client from '../client.js'
import { logToFile } from '../lib/logging.js'
import { hasID, isEmail } from '../validation.js'

/**
 * @typedef {{email?:string}} Register
 * @typedef {import('yargs').Arguments<Register>} RegisterArgs
 */

/**
 * @async
 * @param {RegisterArgs} argv
 * @returns {Promise<void>}
 */
const exe = async (argv) => {
  const { email } = argv
  // TODO: https://github.com/nftstorage/w3up-cli/issues/15
  // this can hang if there's network disconnectivity.
  const view = ora({
    text: `Registering ${email}, check your email for the link.`,
    spinner: 'line',
  }).start()

  try {
    let result = await client.register(email)
    if (result) {
      view.succeed(`Registration succeeded: ${email}`)
    }
  } catch (err) {
    // @ts-ignore
    view.fail(err.toString())
    logToFile('register', err)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) => yargs.check(() => hasID()).check(checkEmail)

/**
 * @param {RegisterArgs} argv
 */
const checkEmail = (argv) => {
  const { email } = argv
  if (isEmail(email)) {
    return true
  }
  throw new Error(`Error: ${email} is probably not a valid email.`)
}

export default {
  command: 'register <email>',
  describe: 'Register your UCAN Identity with w3up',
  builder,
  handler: exe,
}
