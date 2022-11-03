import { getClient } from '../../client.js'
import { hasSetupAccount, isCID } from '../../validation.js'
import * as API from '@ucanto/interface'
// @ts-ignore
import { parseLink } from '@ucanto/server'
import ora from 'ora'

/**
 * @typedef {{cid?:API.Link, profile?:string}} Remove
 * @typedef {import('yargs').Arguments<Remove>} RemoveArgs
 */

/**
 * @async
 * @param {RemoveArgs} argv
 * @returns {Promise<void>}
 */
const handler = async ({ cid, profile }) => {
  const view = ora(`Unlinking ${cid}...`).start()
  const res = await getClient(profile).remove(
    // @ts-expect-error
    parseLink(cid?.toString() || '')
  )
  view.succeed(`${res.toString()}`)
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) => yargs.check(hasSetupAccount).check(checkCID)

/**
 * @param {RemoveArgs} argv
 */
const checkCID = ({ cid }) => isCID(cid)

//TODO allow list of CIDs
// https://github.com/nftstorage/w3up-cli/issues/20
export default {
  command: ['remove <cid>', 'unlink <cid>'],
  describe: 'Unlink a car by CID from your account.',
  builder,
  handler,
  exampleIn: '$0 remove bafy...',
  exampleOut: `unlinked bafy...`,
}
