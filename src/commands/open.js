import * as API from '@ucanto/interface'
import open from 'open'

import { OPEN_WITH_SERVICE_URL } from '../settings.js'
import { isCID } from '../validation.js'

/**
 * @typedef {{cid?:string}} Cid
 * @typedef {import('yargs').Arguments<Cid>} CidArgs
 */

/**
 * @async
 * @param {CidArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ cid }) => {
  try {
    open(`${OPEN_WITH_SERVICE_URL}${cid}`)
  } catch (err) {
    throw `Could not open ${cid}: ${err}`
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) => yargs.check(checkTarget)

/**
 * @param {CidArgs} argv
 */
const checkTarget = ({ cid }) => {
  if (!cid) {
    throw new Error(`No valid cid or item was provided to open.`)
  }

  const _cid = cid.split('/')[0]

  try {
    return isCID(_cid)
  } catch (err) {
    throw new Error(`${_cid} is probably not a valid CID: \n${err}`)
  }
}

const openCmd = {
  command: 'open <cid>',
  describe: 'Open a CID in your browser on w3s.link',
  builder,
  handler: exe,
  exampleIn: '$0 open bafy...',
  exampleOut: `# opens ${OPEN_WITH_SERVICE_URL}/bafy... in your browser`,
}

export default openCmd
