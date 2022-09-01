import * as UnixFS from '@ipld/unixfs'

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
