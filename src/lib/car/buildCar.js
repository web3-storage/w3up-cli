// @ts-ignore
import * as CAR from '@ipld/car'
import * as UnixFS from '@ipld/unixfs'
import fs from 'fs'
import path from 'path'
import 'web-streams-polyfill'

import { isDirectory } from '../../utils.js'
import { walkDir, wrapFilesWithDir } from './dir.js'
import { streamFileToBlock } from './file.js'

// Internal unixfs read stream capacity that can hold around 32 blocks
const CAPACITY = UnixFS.BLOCK_SIZE_LIMIT * 32
const MAX_CARS_AT_ONCE = 8

/**
 * @typedef {{stream: ReadableStream }} buildCarOutput
 * @typedef {{bytes: Uint8Array|null ,cid: object|null}} Block
 */

/**
 * Create a readable block stream for a given path.
 * @async
 * @param {string} pathName - The path to create a car for.
 * @param {WritableStream} writable - The writable stream.
 * @returns {Promise<void>}
 */
async function createReadableBlockStreamWithWrappingDir(pathName, writable) {
  // Next we create a writer with filesystem like API for encoding files and
  // directories into IPLD blocks that will come out on `readable` end.
  const writer = UnixFS.createWriter({ writable })
  //   writer.settings.chunker.context.maxChunkSize = 1024 * 5

  // hold files to wrap with dir.
  let files = []
  pathName = path.normalize(pathName).replace(/\/$/, '')

  // discover if "root" of tree is directory or file.
  if (isDirectory(pathName)) {
    // if dir, walk down dir tree, and write out blocks
    const fileNames = (await fs.promises.readdir(pathName)).filter(
      (x) => !x.startsWith('.')
    )
    for (var name of fileNames) {
      files.push(
        await walkDir({
          writer,
          pathName: pathName,
          filename: name,
        })
      )
    }
  } else {
    // if file, just write to block and return to wrap.
    files = [await streamFileToBlock({ writer, filePath: pathName })]
  }

  await wrapFilesWithDir({ writer, files, dirName: pathName })
  writer.close()
}

/**
 * @param {number} carsize - The maximum size of a generated car file.
 * @returns {CAR.CarBufferWriter}
 */
function createCarWriter(carsize) {
  const buffer = new ArrayBuffer(carsize)
  return CAR.CarBufferWriter.createWriter(buffer, { roots: [] })
}

/**
 * @async
 * @param {string} pathName - The "root" of the path to generate car(s) for.
 * @param {number} carsize - The maximum size of generated car files.
 * @param {boolean} [failAtSplit=false] - Should this fail if it tries to split into multiple cars.
 * @returns {Promise<buildCarOutput>}
 */
export async function buildCar(pathName, carsize, failAtSplit = false) {
  // Create a redable & writable streams with internal queue
  const { readable, writable } = new TransformStream(
    {},
    UnixFS.withCapacity(CAPACITY)
  )
  const reader = readable.getReader()

  // Start filling the stream async
  createReadableBlockStreamWithWrappingDir(pathName, writable)

  // create the first buffer.
  let carWriter = createCarWriter(carsize)
  let carWriterStream = new TransformStream(
    {},
    {
      highWaterMark: MAX_CARS_AT_ONCE,
    },
    {
      highWaterMark: MAX_CARS_AT_ONCE,
    }
  )
  let carStreamWriter = carWriterStream.writable.getWriter()

  async function readAll() {
    // Keep track of written cids, so that blocks are not duplicated across cars.
    let writtenCids = new Set()

    // track the last written block, so we know the root of the dag.
    /** @type Block */
    let root = { bytes: null, cid: null }
    async function* iterator() {
      while (true) {
        yield reader.read()
      }
    }

    await carStreamWriter.ready
    for await (const { value, done } of iterator()) {
      if (done) {
        break
      }
      if (writtenCids.has(value.cid.toString())) {
        continue
      }

      try {
        carWriter.write(value)
        writtenCids.add(value.cid.toString())
      } catch (err) {
        if (failAtSplit) {
          throw new Error('Content too large for car.')
        }
        const bytes = carWriter.close({ resize: true })
        carStreamWriter.write({ bytes, roots: carWriter.roots })
        carWriter = createCarWriter(carsize)
        carWriter.write(value)
      }
      root = value
    }

    if (root) {
      carWriter.addRoot(root.cid, { resize: root.cid })
    }

    const bytes = await carWriter.close({ resize: true })
    carStreamWriter.write({ bytes, roots: carWriter.roots })
    carStreamWriter.close()
  }
  readAll()

  return {
    stream: carWriterStream.readable,
  }
}
