import path from 'path'
import fs from 'fs'
import 'web-streams-polyfill'
import * as UnixFS from '@ipld/unixfs'
import * as CAR from '@ipld/car'

import * as FixedChunker from '@ipld/unixfs/file/chunker/fixed'

import { fileToBlock } from './file.js'
import { wrapFilesWithDir } from './dir.js'

// Internal queue capacity that can hold around 32 blocks
const CAPACITY = UnixFS.BLOCK_SIZE_LIMIT * 32
// const CAPACITY = 8192 + 128
// const CAR_SIZE = CAPACITY
// const CAR_SIZE = CAPACITY
const CAR_SIZE = CAPACITY

const isDirectory = (pathName) =>
  fs.existsSync(pathName) && fs.lstatSync(pathName).isDirectory()

async function walkDir({ writer, pathName, filename }) {
  const filePath = path.resolve(pathName, filename)

  if (isDirectory(filePath)) {
    return wrapFilesWithDir({
      writer,
      files: await fs.promises.readdir(filePath).then((names) =>
        Promise.all(
          names.map((name) =>
            walkDir({
              writer,
              pathName: pathName + '/' + filename,
              filename: name,
            })
          )
        )
      ),
      dirName: filename,
    })
  }

  return fs.promises
    .readFile(filePath)
    .then((bytes) => fileToBlock({ writer, filename, bytes }))
}

async function createReadableBlockStreamWithWrappingDir(_pathName, writable) {
  // Next we create a writer with filesystem like API for encoding files and
  // directories into IPLD blocks that will come out on `readable` end.
  const writer = UnixFS.createWriter({
    writable,
  })

  writer.settings.chunker = FixedChunker.withMaxChunkSize(8192)

  let files = []
  let pathName = path.normalize(_pathName)

  if (isDirectory(pathName)) {
    //listing all files using forEach
    files = files.concat(
      (
        await fs.promises.readdir(pathName).then((filenames) => {
          return Promise.all(
            filenames.map((filename) => walkDir({ writer, pathName, filename }))
          )
        })
      ).filter((x) => x != null)
    )
  } else {
    let filename = path.basename(pathName)
    const bytes = fs.readFileSync(pathName)
    files = [await fileToBlock({ writer, filename, bytes })]
  }

  await wrapFilesWithDir({ writer, files, dirName: pathName })

  // close the writer to close underlying block stream.
  writer.close()
}

function createBuffer(carsize) {
  const buffer = new ArrayBuffer(carsize)
  return CAR.CarBufferWriter.createWriter(buffer, {
    roots: [],
  })
}

export async function buildCar(pathName, carsize = CAR_SIZE) {
  // Create a redable & writable streams with internal queue that can hold around 32 blocks
  const { readable, writable } = new TransformStream(
    {},
    UnixFS.withCapacity(CAPACITY)
  )

  // Start filling the stream async
  createReadableBlockStreamWithWrappingDir(pathName, writable)
  const reader = readable.getReader()

  let buffer = createBuffer(carsize)
  let buffers = []
  //   let buffers = new TransformStream()
  //   let bw = buffers.writable.getWriter()

  /**
   * @param {ReadableStreamDefaultReadResult<any>} block
   * @returns {Promise<void>|undefined}
   */
  function writeBlockToCar({ done, value }) {
    if (!done) {
      try {
        buffer.write(value)
      } catch (err) {
        buffers.push(buffer)
        //         bw.write(buffer)
        buffer = createBuffer(carsize)
        buffer.write(value)
      }
      return reader.read().then(writeBlockToCar)
    } else {
      buffers.push(buffer)
      //       bw.write(buffer)
      //       return bw.close()
    }
  }

  await reader.read().then(writeBlockToCar)
  //   buffers.push(buffer)
  //   bw.write(buffer)
  return { buffers, max_car_size: carsize }
}
