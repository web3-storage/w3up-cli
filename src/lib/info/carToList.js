import { toOutput } from './common.js'
import { CarIndexer } from '@ipld/car/indexer'
import { CarReader } from '@ipld/car/reader'

/**
 * @async
 * @param {Buffer|Uint8Array} bytes
 * @returns {Promise<string>} A simple list of all CIDs in the car.
 */
export async function run (bytes) {
  const indexer = await CarIndexer.fromBytes(bytes)
  const reader = await CarReader.fromBytes(bytes)
  let output = 'CIDv1\t\t\t\t\t\t\t\tCIDv0\n'

  const roots = reader._header.roots // a little naughty but we need gory details

  output += 'ROOTS:\n'
  for (const root of roots) {
    output += toOutput(root)
  }

  output += '\n\nCIDS:\n'
  for await (const blockIndex of indexer) {
    if (roots.find((x) => x.toString() === blockIndex.cid.toString())) {
      continue
    }
    const block = await reader.get(blockIndex.cid)
    if (!block?.bytes) {
      throw new Error('no blocks')
    }

    output += `${toOutput(blockIndex.cid)}\n`
  }
  return output
}
