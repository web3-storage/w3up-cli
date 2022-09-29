import ora, { oraPromise } from 'ora'

import client from '../client.js'
import { settings } from '../client.js'

/**
 * @typedef {{reset?:boolean}} Id
 * @typedef {import('yargs').Arguments<Id>} IdArgs
 */

/**
 * @async
 * @param {IdArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ reset }) => {
  const view = ora({ spinner: 'line' })
  await setupAccount(view)
  await setupAgent(view)
}

/**
 * @async
 * @param {import('ora').Ora} view
 * @returns {Promise<void>}
 */
async function setupAccount(view) {
  let text = !settings.has('account_secret')
    ? 'Generating new account'
    : 'Loading account'

  const id = await oraPromise(client.identity(), text)
  if (id) {
    view.succeed('ID: ' + id.did())
  }
}

/**
 * @async
 * @param {import('ora').Ora} view
 * @returns {Promise<void>}
 */
async function setupAgent(view) {
  let text = !settings.has('agent_secret')
    ? 'Generating new agent'
    : 'Loading agent'

  const id = await oraPromise(client.identity(), text)
  if (id) {
    view.succeed('ID: ' + id.did())
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) =>
  yargs.option('reset', {
    type: 'boolean',
    alias: 'reset',
    showInHelp: true,
    describe: 'reset settings and generate id.',
  })

export default {
  command: 'setup',
  describe: 'Generate a UCAN account and agent',
  builder,
  handler: exe,
  exampleOut: `ID loaded: did:key:z6MkiWm...`,
  exampleIn: '$0 id',
}
