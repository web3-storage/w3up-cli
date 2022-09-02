import * as UnixFS from '@ipld/unixfs'
import fs from 'fs'
import path from 'path'

/**
 * @async
 * @param {object} options
 * @param {UnixFS.Writer} options.writer -
 * @param {any} options.filename -
 * @param {any} options.bytes -
 * @returns {Promise<{name:string, link:any}>}
 */
export async function fileToBlock({ writer, filename, bytes }) {
  // make file writer, write to it, and close it to get link/cid
  const file = UnixFS.createFileWriter(writer)
  file.write(bytes)
  const link = await file.close()

  return {
    name: filename,
    link,
  }
}

/**
 * @async
 * @param {object} options
 * @param {UnixFS.Writer} options.writer
 * @param {string} options.filePath
 * @returns {Promise<{name:string, link:any}>}
 */
export async function streamFileToBlock({ writer, filePath }) {
  const stream = fs.createReadStream(filePath, { encoding: 'binary' })
  const file = UnixFS.createFileWriter(writer)

  for await (const data of stream) {
    file.write(new Uint8Array(Buffer.from(data, 'binary')))
  }

  const link = await file.close()

  return {
    name: path.basename(filePath),
    link,
  }
}
/**
 *
 * @param {string} target
 * @returns {boolean}
 */
export const isDirectory = (target) => {
  return fs.lstatSync(target).isDirectory() == true
}

/**
 * @todo Make a depth flag?
 * @param {string} targetDirectory
 * @returns {string[]}
 * @description Given any directory, recursively walk and return all files in a list.
 */
export const getAllFiles = (targetDirectory) => {
  return fs.readdirSync(targetDirectory).flatMap((item) => {
    const path = `${targetDirectory}/${item}`
    if (fs.statSync(path).isDirectory()) {
      return getAllFiles(path)
    }
    return path
  })
}

// export async function generateTestFiles({
//   writer,
//   filename,
//   start = 0,
//   count = 0,
// }) {
//   let files = []
//   for (var i = start; i < start + count; i++) {
//     files.push(
//       await fileToBlock({
//         writer,
//         filename: filename + i,
//         bytes: new TextEncoder().encode('this is a test' + i),
//       })
//     )
//   }
//   return files
// }
