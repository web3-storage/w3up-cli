import ora from 'ora'
import fs from 'fs'
import path from 'path'

import { hasID, isPath } from '../validation.js'
import { isDirectory } from '../utils.js'
import { uploadExistingCar } from './upload.js'

/**
 * @typedef {{path?:string}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 */

/**
 * @async
 * @param {UploadArgs} argv
 * @returns {Promise<void>}
 */
const exe = async (argv) => {
  const _path = argv.path
  const view = ora({ text: `Uploading ${_path}...`, spinner: 'line' }).start()

  if (!_path) {
    return Promise.reject('You must Specify a Path')
  }

  if (!isDirectory(_path)) {
    return Promise.reject('Path must be directory for bulk uploads.')
  }

  const stream = new TransformStream(
    {},
    { highWaterMark: 1 },
    { highWaterMark: 1 }
  )
  const writer = stream.writable.getWriter()
  const reader = stream.readable.getReader()

  const files = await fs.promises.readdir(_path)

  for (const file of files) {
    if (isDirectory(file)) {
      continue
    }
    writer.write(path.join(_path, file))
  }

  let done = false
  while (!done) {
    const read = await reader.read().then((read) => {
      uploadExistingCar(read.value, view)
      return read
    })
    done = read.done
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) => yargs.check(() => hasID()).check(checkPath)

/**
 * @param {UploadArgs} argv
 */
const checkPath = ({ path }) => {
  try {
    return isPath(path)
  } catch (err) {
    throw new Error(
      `${path} is probably not a valid path to a file or directory: \n${err}`
    )
  }
}

const bulkUpload = {
  cmd: ['upload-cars <path>'],
  description: 'Upload a file or directory to your account',
  build,
  exe,
  exampleIn: '$0 upload-cars ducks/',
  exampleOut: `uploaded bafy...`,
}

export default bulkUpload
