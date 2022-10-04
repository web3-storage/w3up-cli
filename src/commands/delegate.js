import fs from 'fs'
import ora from 'ora'

import { getClient } from '../client.js'

/**
 * @typedef {import('yargs').Arguments<{did?:string, profile: string}>} DelegateArgs
 */

/**
 * @async
 * @param {DelegateArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ did, profile }) => {
  const view = ora({ spinner: 'line' })
  const client = getClient(profile)

  const delegation = await client.makeDelegation({ to: did })
  fs.writeFileSync('delegation.car', delegation, 'binary')

  view.succeed('Wrote delegation to delegation.car')
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) => yargs

const id = {
  command: 'delegate <did>',
  describe: 'Delegate permissions to another DID',
  builder: build,
  handler: exe,
}

export default id
