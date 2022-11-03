import { getClient } from '../../client.js'
// import { delegationToString } from '../../encoding.js'
// import { delegationToString } from '@web3-storage/w3up-client'
import { hasSetupAccount } from '../../validation.js'
import fs from 'fs'
import ora from 'ora'

/**
 * @typedef {{did?:`did:${string}`, profile?: string}} Delegate
 * @typedef {import('yargs').Arguments<Delegate>} DelegateArgs
 */

/**
 * @async
 * @param {DelegateArgs} argv
 * @returns {Promise<void>}
 */
const handler = async ({ did, profile }) => {
  const view = ora({ spinner: 'line' })
  const client = getClient(profile)

  if (!did) {
    view.fail('You must provide a did to delegate to.')
    return
  }

  const delegation = await client.makeDelegation({ to: did })
  fs.writeFileSync('delegation.txt', delegation.toString(), 'utf8')

  view.succeed('Wrote delegation to delegation.txt')
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) => yargs.check(hasSetupAccount)

export default {
  command: 'to <did>',
  describe: 'Delegate permissions to another DID',
  builder,
  handler
}
