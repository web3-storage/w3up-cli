import ora from 'ora'
import { getClient, getProfileSettings, saveSettings } from '../client.js'

/**
 * @typedef {{reset?:boolean, profile?: string}} Id
 * @typedef {import('yargs').Arguments<Id>} IdArgs
 */

/**
 * @async
 * @param {IdArgs} args
 * @returns {Promise<void>}
 */
const handler = async (args) => {
  const view = ora({ spinner: 'line' })

  if (args.reset) {
    getProfileSettings(args.profile).clear()
  }

  const client = getClient(args.profile)
  const identity = await client.identity()

  saveSettings(client, args.profile)

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

export default {
  command: 'id',
  describe: 'Generate a UCAN Identity',
  builder,
  handler,
  exampleOut: `ID loaded: did:key:z6MkiWm...`,
  exampleIn: '$0 id',
}
