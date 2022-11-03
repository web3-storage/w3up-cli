import * as dagCbor from '@ipld/dag-cbor'
import * as dagJson from '@ipld/dag-json'
import * as dagPb from '@ipld/dag-pb'
import * as UnixFS from '@ipld/unixfs'
import * as json from 'multiformats/codecs/json'
import * as raw from 'multiformats/codecs/raw'

/** @typedef {import('multiformats/cid').CID} CID */
/** @typedef {{decode:(data:any)=>any}} Codec */
/** @typedef {Object<number, Codec>} CodecMap */

/** @type {CodecMap} */
export const codecs = {
  [dagCbor.code]: dagCbor,
  [dagPb.code]: dagPb,
  [dagJson.code]: dagJson,
  [raw.code]: raw,
  [json.code]: json
}

export const codecNames = {
  [dagCbor.code]: 'dagCbor',
  [dagPb.code]: 'dagPb',
  [dagJson.code]: 'dagJson',
  [raw.code]: 'raw',
  [json.code]: 'json'
  //   [0x202]: 'car',
}

export const nodeTypeNames = {
  [UnixFS.NodeType.Directory]: 'dir',
  [UnixFS.NodeType.File]: 'file',
  [UnixFS.NodeType.HAMTShard]: 'hamt',
  [UnixFS.NodeType.Metadata]: 'meta',
  [UnixFS.NodeType.Raw]: 'raw',
  [UnixFS.NodeType.Symlink]: 'sym'
}

/**
 * @param {CID} cid
 * @param {Uint8Array} bytes
 * @throws {Error}
 * @returns {object}
 */
export function decode (cid, bytes) {
  // @ts-ignore
  if (!codecs[cid.code]) {
    throw new Error(`Unknown codec code: 0x${cid.code.toString(16)}`)
  }

  if (cid.code === dagPb.code) {
    try {
      return UnixFS.decode(bytes)
    } catch (err) {
      return codecs[cid.code].decode(bytes)
    }
  }

  // @ts-ignore
  return codecs[cid.code].decode(bytes)
}

/**
 * @param {object} cid - the CID to format to a short form for output.
 * @returns {string} The shortned CID.
 */
export function toShortCID (cid) {
  const str = cid.toString()
  return str.substring(0, 4) + '...' + str.substring(str.length - 4, str.length)
}

/**
 * @param {CID} cid
 */
export function toOutput (cid) {
  const cidv1 = cid.toString()
  let cidv0 = 'N/A'

  try {
    cidv0 = 'z' + cid.toV0().toString()
  } catch (err) {}

  return `${cidv1}\t${cidv0}`
}
