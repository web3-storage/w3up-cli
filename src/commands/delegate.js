import fs from 'fs'
import ora, { oraPromise } from 'ora'

import client from '../client.js'

/**
 * @typedef {import('yargs').Arguments<{did?:string}>} DelegateArgs
 */

/**
 * @async
 * @param {DelegateArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ did }) => {
  const view = ora({ spinner: 'line' })

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
