import ora, { oraPromise } from 'ora'

import client, { settings } from '../client.js'

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

  if (reset) {
    settings.clear()
  }

  const id = await client.identity()
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

const id = {
  command: 'id',
  describe: 'Generate a UCAN Identity',
  builder,
  handler: exe,
  exampleOut: `ID loaded: did:key:z6MkiWm...`,
  exampleIn: '$0 id',
}

export default id
