import * as UnixFS from '@ipld/unixfs'

export async function wrapFilesWithDir({ writer, files, dirName = '' }) {
  const dir = UnixFS.createDirectoryWriter(writer)
  files.forEach((file) => dir.set(file.name, file.link))
  const dirLink = await dir.close()

  return {
    name: dirName,
    link: dirLink,
  }
}
