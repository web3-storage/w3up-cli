import path from 'path'
import fs from 'fs'
import 'web-streams-polyfill'
import * as UnixFS from '@ipld/unixfs'
import * as CAR from '@ipld/car'

import { fileToBlock } from './file.js'
import { wrapFilesWithDir } from './dir.js'

// Internal queue capacity that can hold around 32 blocks
const CAPACITY = UnixFS.BLOCK_SIZE_LIMIT * 32
const CAR_SIZE = CAPACITY

/**
 * @param {string} pathName - The path to check if it's a directory
 * @returns {boolean}
 */
const isDirectory = (pathName) =>
  fs.existsSync(pathName) && fs.lstatSync(pathName).isDirectory()

/**
 * @async
 * @param {object} options
 * @param {object} options.writer - The UnixFS writer
 * @param {string} options.pathName - The current recursive pathname
 * @param {string} options.filename - The current filename
 * @returns {Promise<object>}
 */
async function walkDir({ writer, pathName, filename }) {
  const filePath = path.resolve(pathName, filename)

  if (isDirectory(filePath)) {
    const fileNames = await fs.promises.readdir(filePath)
    let files = []
    for (var name of fileNames) {
      files.push(
        await walkDir({
          writer,
          pathName: pathName + '/' + filename,
          filename: name,
        })
      )
    }
    return wrapFilesWithDir({
      writer,
      files,
      dirName: filename,
    })
  }

  const bytes = await fs.promises.readFile(filePath)
  return await fileToBlock({ writer, filename, bytes })
}

/**
 * Create a readable block stream for a given path.
 *
 * @async
 * @param {string} pathName - The path to create a car for.
 * @param {WritableStream} writable - The writable stream.
 * @returns {Promise<void>}
 */
async function createReadableBlockStreamWithWrappingDir(pathName, writable) {
  // Next we create a writer with filesystem like API for encoding files and
  // directories into IPLD blocks that will come out on `readable` end.
  const writer = UnixFS.createWriter({ writable })

  // hold files to wrap with dir.
  let files = []
  pathName = path.normalize(pathName)

  // discover if "root" of tree is directory or file.
  if (isDirectory(pathName)) {
    // if dir, walk down dir tree, and write out blocks
    const fileNames = await fs.promises.readdir(pathName)
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
    let filename = path.basename(pathName)
    const bytes = fs.readFileSync(pathName)
    files = [await fileToBlock({ writer, filename, bytes })]
  }

  await wrapFilesWithDir({ writer, files, dirName: pathName })
  writer.close()
}

/**
 * @param {number} carsize - The maximum size of a generated car file.
 * @returns {CAR.CarBufferWriter}
 */
function createBuffer(carsize) {
  const buffer = new ArrayBuffer(carsize)
  return CAR.CarBufferWriter.createWriter(buffer, { roots: [] })
}

/**
 * @async
 * @param {string} pathName - The "root" of the path to generate car(s) for.
 * @param {number} [carsize] - The maximum size of generated car files.
 * @returns {Promise<ReadableStreamReader<any>>}
 */
export async function buildCar(
  pathName,
  carsize = CAR_SIZE,
  failAtSplit = false
) {
  // Create a redable & writable streams with internal queue that can hold around 32 blocks
  const { readable, writable } = new TransformStream(
    {},
    UnixFS.withCapacity(CAPACITY)
  )
  const reader = readable.getReader()

  // Start filling the stream async
  createReadableBlockStreamWithWrappingDir(pathName, writable)

  // create the first buffer.
  let buffer = createBuffer(carsize)
  let bufferStream = new TransformStream(
    {},
    {
      highWaterMark: 4,
    }
  )
  let bufferStreamWriter = bufferStream.writable.getWriter()

  // Keep track of written cids, so that blocks are not duplicated across cars.
  let writtenCids = []

  // track the last written block, so we know the root of the dag.
  let root = {}

  /**
   * @param {ReadableStreamDefaultReadResult<any>} block
   * @returns {Promise<void>}
   */
  async function writeBlockToCar({ done, value }) {
    await bufferStreamWriter.ready

    if (!done && !writtenCids.includes(value.cid.toString())) {
      try {
        await buffer.write(value)
      } catch (err) {
        if (failAtSplit) {
          throw new Error('Content too large for car.')
        }
        const bytes = await buffer.close({ resize: true })
        bufferStreamWriter.write({ bytes, roots: buffer.roots })
        buffer = createBuffer(carsize)
        await buffer.write(value)
      }

      writtenCids.push(value.cid.toString())
      root = value
      return reader.read().then(writeBlockToCar)
    } else {
      if (root) {
        buffer.addRoot(root.cid, { resize: root.cid })
      }
      const bytes = await buffer.close({ resize: true })
      bufferStreamWriter.write({ bytes, roots: buffer.roots })
      return bufferStreamWriter.close()
    }
  }

  return {
    stream: bufferStream.readable.getReader(),
    _reader: reader.read().then(writeBlockToCar),
  }
}
