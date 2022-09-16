import * as API from '@ucanto/interface'
// @ts-ignore
import { parseLink } from '@ucanto/server'
import ora from 'ora'

import client from '../client.js'
import { hasID, isCID } from '../validation.js'

/**
 * @typedef {{cid?:API.Link}} Remove
 * @typedef {import('yargs').Arguments<Remove>} RemoveArgs
 */

/**
 * @async
 * @param {RemoveArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ cid }) => {
  const view = ora(`Unlinking ${cid}...`).start()
  const res = await client.remove(parseLink(cid))
  view.succeed(`${res.toString()}`)
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) => yargs.check(() => hasID()).check(checkCID)

/**
 * @param {RemoveArgs} argv
 */
const checkCID = ({ cid }) => {
  try {
    return isCID(cid)
  } catch (err) {
    throw new Error(`${cid} is probably not a valid CID: \n${err}`)
  }
}

//TODO allow list of CIDs
// https://github.com/nftstorage/w3up-cli/issues/20
const remove = {
  cmd: ['remove <cid>', 'unlink <cid>'],
  description: 'Unlink a CID from your account.',
  build,
  exe,
  exampleIn: '$0 remove bafy...',
  exampleOut: `unlinked bafy...`,
}

export default remove
