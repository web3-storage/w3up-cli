import fs from 'fs'
import { CarReader } from '@ipld/car/reader'
import { CarIndexer } from '@ipld/car/indexer'
import * as UnixFS from '@ipld/unixfs'
import * as dagCbor from '@ipld/dag-cbor'
import * as dagPb from '@ipld/dag-pb'
import * as dagJson from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'
import * as json from 'multiformats/codecs/json'

import archy from 'archy'

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

  //   let output = ''
  let output = {
    label: 'roots',
    nodes: [],
  }

  const roots = []
  const blockMap = new Map()

  for await (const blockIndex of indexer) {
    const block = await reader.get(blockIndex.cid)
    if (!block?.bytes) {
      throw 'no blocks'
    }
    //     const type = codecNames[blockIndex.cid.code]
    const content = decode(blockIndex.cid, block.bytes)

    const isRoot = fixture.header.roots.some(
      (x) => x.toString() == blockIndex.cid.toString()
    )
    const links = content.Links || content?.entries || []
    blockMap.set(blockIndex.cid.toString(), {
      cid: blockIndex.cid.toString(),
      links: links,
    })
    if (isRoot) {
      roots.push({
        cid: blockIndex.cid.toString(),
        links: links,
      })
    }
  }

  for (const root of roots) {
    output.nodes.push(walkTree(root.cid, '', blockMap))
  }

  return archy(output)
}

function walkTree(cid, name, blockMap) {
  const block = blockMap.get(cid)

  if (!block) {
    return null
  }

  const label = name.length > 0 ? name : cid

  return {
    label,
    nodes: block.links
      .map((x) =>
        walkTree(x.cid.toString(), x?.name || x?.Name || '', blockMap)
      )
      .filter((x) => x),
  }
}
