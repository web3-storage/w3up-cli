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
const exe = async ({ cid }) => {
  open(`https://w3s.link/ipfs/${cid}`)
}

const openCmd = {
  cmd: 'open <cid>',
  description: 'Open a CID in your browser on w3s.link',
  build: {},
  exe,
  exampleIn: '$0 open bafy...',
  exampleOut: '# opens https://w3s.link/ipfs/bafy... in your browser',
}

export default openCmd
