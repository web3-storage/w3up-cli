import fs from 'fs'
import { CarReader } from '@ipld/car/reader'
import { CarIndexer } from '@ipld/car/indexer'
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

function decode(cid, bytes) {
  if (!codecs[cid.code]) {
    throw new Error(`Unknown codec code: 0x${cid.code.toString(16)}`)
  }
  return codecs[cid.code].decode(bytes)
}

/**
 * @param {object} cid - the CID to format to a short form for output.
 * @returns {string} The shortned CID.
 */
function toShortCID(cid) {
  let str = cid.toString()
  return (
    str.substring(0, 4) + '...' + str.substring(str.length - 5, str.length - 1)
  )
}

const ignoredKeysForLabel = ['blockLength', 'offset', 'blockOffset']

const dirContent = Buffer.from([8, 1])

/**
 * @param {object} obj
 * @param {object} value
 * @returns {boolean}
 */
function isUnixFSDirectory(obj, value) {
  return (
    obj.type == 'dagPb' &&
    (value.Links.length > 0 || value?.Data?.toString() == dirContent.toString())
  )
}

/**
 * @param {object} obj
 * @param {object} value
 * @returns {boolean}
 */
function isUnixFSFile(obj, value) {
  return obj.type == 'dagPb' && value.Links.length == 0
}

function buildLabel(obj) {
  let label = Object.entries(obj)
    .map(([key, val]) => {
      if (ignoredKeysForLabel.includes(key)) {
        return ''
      }
      if (key == 'cid') {
        return toShortCID(val)
      }
      if (typeof val == 'object') {
        if (key == 'content') {
          if (isUnixFSDirectory(obj, val)) {
            return '{unixfs|dir}'
          }
          if (isUnixFSFile(obj, val)) {
            return `{unixfs|file}`
          }

          if (obj.type == 'dagCbor') {
            let data = val?.id // has metadata id
            if (data) {
              return `{session_id|${data}}`
            }
          }
        }
        return ''
      }
      return `{${key}|${val.toString()}}`
    })
    .filter((x) => x.length > 4)
    .join('|')

  return `${label}`
}

/**
 * @async
 * @param {Buffer|Uint8Array} bytes
 * @returns {Promise<string>} the DOT format output of the DAG in the car.
 */
export async function run(bytes) {
  const indexer = await CarIndexer.fromBytes(bytes)
  const reader = await CarReader.fromBytes(bytes)
  const fixture = {
    header: reader._header, // a little naughty but we need gory details
    blocks: [],
  }

  let dot = `digraph { 
\tgraph [nodesep="0.25", ranksep="1" splines=line];
\tlabeljust=l;
\tlabelloc=c;
\tnode [shape=record];
  `

  let linkDot = ''

  let i = 0
  for await (const blockIndex of indexer) {
    fixture.blocks[i] = blockIndex
    const block = await reader.get(blockIndex.cid)

    fixture.blocks[i].type = codecNames[blockIndex.cid.code]
    fixture.blocks[i].content = decode(blockIndex.cid, block.bytes)

    const cur = fixture.blocks[i]
    const links = cur.content.Links || []
    const scid = toShortCID(cur.cid)

    const label = buildLabel(cur)
    if (fixture.header.roots.some((x) => x.toString() == cur.cid.toString())) {
      if (links.length > 0) {
        dot += `\n\t"${scid}" [label="{${label}}" style="rounded" labeljust=l]`
      } else {
        dot += `\n\t"${scid}" [label="{${label}}" style="rounded" labeljust=l]`
      }
    } else {
      dot += `\n\t"${scid}" [label="{${label}}" labeljust=l]`
    }

    links.forEach((link) => {
      linkDot += `\n\t"${scid}" -> "${toShortCID(link['Hash'])}" `
      linkDot += `[label="${link['Name']}" labeljust=c]`
    })

    i++
  }

  if (linkDot) {
    linkDot = '\n' + linkDot
  }

  dot += linkDot + '\n}'

  const json = new TextDecoder().decode(dagJson.encode(fixture))
  return dot
}
