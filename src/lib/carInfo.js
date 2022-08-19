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

function toShortCID(cid) {
  let str = cid.toString()
  return (
    str.substring(0, 4) + '...' + str.substring(str.length - 5, str.length - 1)
  )
}

const ignoredKeysForLabel = ['blockLength', 'offset', 'blockOffset']

const dirContent = Buffer.from([8, 1])

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
          const isDir =
            obj.type == 'dagPb' &&
            (val.Links.length > 0 ||
              val?.Data?.toString() == dirContent.toString())
          const isFile = obj.type == 'dagPb' && val.Links.length == 0

          /*           if (!data && obj.type == 'dagCbor') { */
          /*             data = val?.id; */
          /*             return `{session_id|${data}}`; */
          /*           } */
          if (isDir) {
            return '{unixfs|dir}'
          }

          if (isFile) {
            return `{unixfs|file}`
            /*             return `{unixfs|file}|{content|${data}}`; */
          }
          /*  */
          /*           return data ? `{content|${data}}` : `{content|${val}}`; */
        }
        return ''
      }
      return `{${key}|${val.toString()}}`
    })
    .filter((x) => x.length > 4)
    .join('|')

  return `${label}`
}

export async function run(bytes) {
  //   const bytes = fs.readFileSync(filename);
  const indexer = await CarIndexer.fromBytes(bytes)
  const reader = await CarReader.fromBytes(bytes)
  const fixture = {
    header: reader._header, // a little naughty but we need gory details
    blocks: [],
  }

  let dot = `
    digraph { 
      graph [nodesep="0.25", ranksep="1" splines=line];
      labeljust=l;
      labelloc=c;
      node [shape=record];
  `

  let linkDot = ''

  let i = 0
  for await (const blockIndex of indexer) {
    fixture.blocks[i] = blockIndex
    const block = await reader.get(blockIndex.cid)

    fixture.blocks[i].type = codecNames[blockIndex.cid.code]
    fixture.blocks[i].content = decode(blockIndex.cid, block.bytes)

    const cur = fixture.blocks[i]
    const links = fixture.blocks[i].content.Links || []
    const scid = toShortCID(cur.cid)

    const label = buildLabel(cur)
    if (fixture.header.roots.some((x) => x.toString() == cur.cid.toString())) {
      if (links.length > 0) {
        dot += `\n"${scid}" [label="{${label}}" style="rounded" labeljust=l]`
      } else {
        dot += `\n"${scid}" [label="{${label}}" style="rounded" labeljust=l]`
      }
    } else {
      dot += `\n"${scid}" [label="{${label}}" labeljust=l]`
    }

    links.forEach((link) => {
      /*       console.log('links', link); */
      linkDot += `\n"${scid}" -> "${toShortCID(link['Hash'])}" `
      linkDot += `[label="${link['Name']}" labeljust=c]`
    })

    i++
  }

  dot += linkDot + '\n}'

  const json = new TextDecoder().decode(dagJson.encode(fixture))
  return dot
}
