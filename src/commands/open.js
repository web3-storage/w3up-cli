import { OPEN_WITH_SERVICE_URL } from '../settings.js'
import { isCID } from '../validation.js'
import * as API from '@ucanto/interface'
import open from 'open'

/**
 * @typedef {{cid?:string}} Cid
 * @typedef {import('yargs').Arguments<Cid>} CidArgs
 */

/**
 * @async
 * @param {CidArgs} argv
 * @returns {Promise<void>}
 */
const handler = async ({ cid }) => {
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
  return isCID(_cid)
}

export default {
  command: 'open <cid>',
  describe: 'Open a CID in your browser on w3s.link',
  builder,
  handler,
  exampleIn: '$0 open bafy...',
  exampleOut: `# opens ${OPEN_WITH_SERVICE_URL}/bafy... in your browser`
}
