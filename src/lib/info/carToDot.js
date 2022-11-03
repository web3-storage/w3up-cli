import { humanizeBytes } from '../../utils.js'
import { codecNames, decode, nodeTypeNames, toShortCID } from './common.js'
import { CarIndexer } from '@ipld/car/indexer'
import { CarReader } from '@ipld/car/reader'

const ignoredKeysForLabel = ['blockLength', 'offset', 'blockOffset']

// @ts-ignore
/** @typedef {import('multiformats/cid').CID} CID */

/**
 * Build a label for a node in the graph.
 * @param {object} obj - The node data.
 * @returns {string} - The built label.
 */
function buildLabel (obj) {
  const label = Object.entries(obj)
    .map(([key, val]) => {
      if (ignoredKeysForLabel.includes(key)) {
        return ''
      }
      if (key === 'cid') {
        return toShortCID(val)
      }
      if (typeof val === 'object') {
        if (key === 'content') {
          if (val?.type) {
            const bytes = val.content
              ? `|{size|${humanizeBytes(val.content?.byteLength)}}`
              : ''
            // @ts-ignore
            return `{unixfs|${nodeTypeNames[val?.type]}}${bytes}`
          }

          // @ts-ignore
          if (obj.type === 'dagCbor') {
            const data = val?.id // has metadata id
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
 * @param {boolean} vertical - should the graph output be 'vertical' (i.e. rankdir LR)
 * @returns {Promise<string>} the DOT format output of the DAG in the car.
 */
export async function run (bytes, vertical) {
  const indexer = await CarIndexer.fromBytes(bytes)
  const reader = await CarReader.fromBytes(bytes)
  /** @type {{roots:Array<any>, blocks:any}} */
  const fixture = {
    roots: reader._header.roots, // a little naughty but we need gory details
    blocks: []
  }

  let dot = `digraph { 
\tgraph [nodesep="0.1", ranksep="1.5" splines=line rankdir="${
    vertical ? 'LR' : 'TB'
  }"
];
\tlabeljust=l;
\tlabelloc=b;
\tnode [shape=record margin=0.04];
`
  let linkDot = ''

  for await (const blockIndex of indexer) {
    const block = await reader.get(blockIndex.cid)
    /** @type any */
    const cur = { ...block }

    // @ts-ignore
    cur.type = codecNames[blockIndex.cid.code]
    cur.content = decode(blockIndex.cid, cur.bytes)

    /** @type Array<any> */
    const links = cur.content.Links || cur.content?.entries || []
    const scid = toShortCID(cur.cid)

    const label = buildLabel(cur)
    if (fixture.roots.some((x) => x.toString() === cur.cid.toString())) {
      if (links.length > 0) {
        dot += `\n\t"${scid}" [label="{${label}|{root}}" style="rounded" labeljust=l]`
      } else {
        dot += `\n\t"${scid}" [label="{${label}}" style="rounded" labeljust=l]`
      }
    } else {
      dot += `\n\t"${scid}" [label="{${label}}" labeljust=l]`
    }

    links.forEach((link) => {
      const cid = link?.cid || link?.Hash
      const name = link?.name || link?.Name
      linkDot += `\n\t"${scid}" -> "${toShortCID(cid)}" `
      const ports = vertical
        ? 'tailport="e" headport="w"'
        : 'tailport="s" headport="n"'

      linkDot += `[headlabel="${name}" ${ports}]`
    })
  }

  if (linkDot) {
    linkDot = '\n' + linkDot
  }

  dot += linkDot + '\n}'

  return dot
}
