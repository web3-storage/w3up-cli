import * as UnixFS from '@ipld/unixfs'
import fs from 'fs'
import path from 'path'

import { isDirectory } from '../../utils.js'
import { streamFileToBlock } from './file.js'

/** @typedef {{name: string, link: any}} FileDesc */

/**
 * @async
 * @param {object} options
 * @param {UnixFS.Writer} options.writer - The UnixFS writer
 * @param {string} options.pathName - The current recursive pathname
 * @param {string} options.filename - The current filename
 * @returns {Promise<FileDesc>}
 */
export async function walkDir({ writer, pathName, filename }) {
  const filePath = path.resolve(pathName, filename)

  if (isDirectory(filePath)) {
    /** @type {Array<FileDesc>} */
    let files = []
    const fileNames = (await fs.promises.readdir(filePath)).filter(
      (x) => !x.startsWith('.')
    )
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

  return await streamFileToBlock({ writer, filePath })
}

/**
 * @async
 * @param {object} options
 * @param {any} options.writer
 * @param {Array<{name:string, link:any}>} options.files
 * @param {string} options.dirName
 * @returns {Promise<{name:string, link:any}>}
 */
export async function wrapFilesWithDir({ writer, files, dirName = '' }) {
  const dir = UnixFS.createDirectoryWriter(writer)
  files.forEach((file) => dir.set(file.name, file.link))
  const dirLink = await dir.close()

  return {
    name: dirName,
    link: dirLink,
  }
}
