import open from 'open'

import { OPEN_WITH_SERVICE_URL } from '../settings.js'

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
  open(`${OPEN_WITH_SERVICE_URL}${cid}`)
}

const openCmd = {
  cmd: 'open <cid>',
  description: 'Open a CID in your browser on w3s.link',
  build: {},
  exe,
  exampleIn: '$0 open bafy...',
  exampleOut: `# opens ${OPEN_WITH_SERVICE_URL}/bafy... in your browser`,
}

export default openCmd
