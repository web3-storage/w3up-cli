import fs from 'fs'
import { CarReader } from '@ipld/car/reader'
import { CarIndexer } from '@ipld/car/indexer'
import * as UnixFS from '@ipld/unixfs'
import * as dagCbor from '@ipld/dag-cbor'
import * as dagPb from '@ipld/dag-pb'
import * as dagJson from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'
import * as json from 'multiformats/codecs/json'

const codecs = {
  [dagCbor.code]: dagCbor,
  [dagPb.code]: dagPb,
  [dagJson.code]: dagJson,
  [raw.code]: raw,
  [json.code]: json,
}

const codecNames = {
  [dagCbor.code]: 'dagCbor',
  [dagPb.code]: 'dagPb',
  [dagJson.code]: 'dagJson',
  [raw.code]: 'raw',
  [json.code]: 'json',
}

const nodeTypeNames = {
  [UnixFS.NodeType.Directory]: 'dir',
  [UnixFS.NodeType.File]: 'file',
  [UnixFS.NodeType.HAMTShard]: 'hamt',
  [UnixFS.NodeType.Metadata]: 'meta',
  [UnixFS.NodeType.Raw]: 'raw',
  [UnixFS.NodeType.Symlink]: 'sym',
}

/**
 * @param {import('multiformats/cid').CID} cid
 * @param {Uint8Array} bytes
 * @throws {Error}
 * @returns {object}
 */
function decode(cid, bytes) {
  if (!bytes) {
    throw new Error('No data passed to decode')
  }
  if (!codecs[cid.code]) {
    throw new Error(`Unknown codec code: 0x${cid.code.toString(16)}`)
  }

  if (cid.code == dagPb.code) {
    try {
      return UnixFS.decode(bytes)
    } catch (err) {
      return codecs[cid.code].decode(bytes)
    }
  }

  return codecs[cid.code].decode(bytes)
}

/**
 * @async
 * @param {Buffer|Uint8Array} bytes
 * @param {boolean} vertical - should the graph output be 'vertical' (i.e. rankdir LR)
 * @returns {Promise<string>} the DOT format output of the DAG in the car.
 */
export async function run(bytes, vertical) {
  const indexer = await CarIndexer.fromBytes(bytes)
  const reader = await CarReader.fromBytes(bytes)
  /** @type {{header:any, blocks:any}} */
  const fixture = {
    header: reader._header, // a little naughty but we need gory details
    blocks: [],
  }

  let output = ''

  for await (const blockIndex of indexer) {
    const block = await reader.get(blockIndex.cid)
    if (!block?.bytes) {
      throw 'no blocks'
    }
    const type = codecNames[blockIndex.cid.code]
    const content = decode(blockIndex.cid, block.bytes)

    const nodeType = nodeTypeNames[content?.type]
    //     if (nodeType == 'file') {
    //       continue
    //     }
    output += '\n' + blockIndex.cid.toString()
    //     output +=
    //       '\n' +
    //       (content.Links || content?.entries || [])
    //         .map((x) => x?.name || x?.Name)
    //         .filter((x) => x)
    //         .map((x) => blockIndex.cid.toString() + '/' + x)
    //         .join('\n')
  }
  return output
}
