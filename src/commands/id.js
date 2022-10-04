import ora from 'ora'

import { getClient, getSettings } from '../client.js'

/**
 * @typedef {{reset?:boolean, profile: string}} Id
 * @typedef {import('yargs').Arguments<Id>} IdArgs
 */

/**
 * @async
 * @param {IdArgs} args
 * @returns {Promise<void>}
 */
const exe = async (args) => {
  const view = ora({ spinner: 'line' })

  if (args.reset) {
    getSettings(args.profile)?.clear()
  }

  const client = getClient(args.profile)
  const identity = await client.identity()

  view.succeed('Agent DID: ' + identity.agent.did())
  view.succeed('Account DID: ' + identity.account.did())
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

const id = {
  command: 'id',
  describe: 'Generate a UCAN Identity',
  builder,
  handler: exe,
  exampleOut: `ID loaded: did:key:z6MkiWm...`,
  exampleIn: '$0 id',
}

export default id
