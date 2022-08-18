import * as UnixFS from '@ipld/unixfs'

export async function fileToBlock({ writer, filename, bytes }) {
  // make file writer, write to it, and close it to get link/cid
  const file = UnixFS.createFileWriter(writer)
  file.write(bytes)
  const fileLink = await file.close()

  return {
    name: filename,
    link: fileLink,
  }
}

export async function generateTestFiles({
  writer,
  filename,
  start = 0,
  count = 0,
}) {
  let files = []
  for (var i = start; i < start + count; i++) {
    files.push(
      await fileToBlock({
        writer,
        filename: filename + i,
        bytes: new TextEncoder().encode('this is a test' + i),
      })
    )
  }
  return files
}
