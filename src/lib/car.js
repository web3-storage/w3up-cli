import path from 'path'
import fs from 'fs'
import 'web-streams-polyfill'
import * as UnixFS from '@ipld/unixfs'
import * as CAR from '@ipld/car'

import { fileToBlock } from './file.js'
import { wrapFilesWithDir } from './dir.js'
import { buildMetaData } from './metadata.js'

// Internal queue capacity that can hold around 32 blocks
const CAPACITY = UnixFS.BLOCK_SIZE_LIMIT * 32

async function walkDir({ writer, pathName, filename }) {
  const filePath = path.resolve(pathName, filename)
  const isDir = fs.lstatSync(filePath).isDirectory()

  if (isDir) {
    return wrapFilesWithDir({
      writer,
      files: await Promise.all(
        fs.readdirSync(filePath).map((name) =>
          walkDir({
            writer,
            pathName: pathName + '/' + filename,
            filename: name,
          })
        )
      ),
      dirName: filename,
    })
  }
  const bytes = fs.readFileSync(filePath)
  return await fileToBlock({ writer, filename, bytes })
}

async function createReadableBlockStreamWithWrappingDir(pathName) {
  // Create a redable & writable streams with internal queue that can hold around 32 blocks
  const { readable, writable } = new TransformStream(
    {},
    UnixFS.withCapacity(CAPACITY)
  )

  // Next we create a writer with filesystem like API for encoding files and
  // directories into IPLD blocks that will come out on `readable` end.
  const writer = UnixFS.createWriter({
    writable,
  })

  let files = []

  const isDir = fs.lstatSync(pathName).isDirectory()

  if (isDir) {
    //listing all files using forEach
    files = files.concat(
      (
        await Promise.all(
          fs
            .readdirSync(pathName)
            .map((filename) => walkDir({ writer, pathName, filename }))
        )
      ).filter((x) => x != null)
    )
  } else {
    const bytes = fs.readFileSync(pathName)
    files = [await fileToBlock({ writer, filename: pathName, bytes })]
  }

  const parent = await wrapFilesWithDir({ writer, files, dirName: pathName })

  // close the writer to close underlying block stream.
  writer.close()

  // return the root and the readable stream.
  return {
    cid: parent.link.cid,
    writer,
    readable,
  }
}

export async function buildCar(pathName) {
  const { cid, readable } = await createReadableBlockStreamWithWrappingDir(
    pathName
  )

  const metadata = await buildMetaData()

  const buffer = new ArrayBuffer(CAPACITY)
  var bw = CAR.CarBufferWriter.createWriter(buffer, {
    roots: [cid, metadata.cid],
  })
  bw.write(metadata)

  const reader = readable.getReader()

  //TODO: detect when buffer overrun, and create new writer, linking new car to prev
  function writeBlockToCar({ done, value }) {
    if (!done) {
      bw.write(value)
      return reader.read().then(writeBlockToCar)
    }
  }
  await reader.read().then(writeBlockToCar)

  return bw.close({ resize: true })
}
