import client from '../client.js'
import ora from 'ora'
import fs from 'fs'
import path from 'path'
import { MAX_CAR_SIZE } from '../settings.js'
import { logToFile } from '../lib/logging.js'
import { isDirectory } from '../lib/file.js'
import { hasID, isPath, resolvePath } from '../validation.js'

/**
 * @async
 * @param {string} filePath - The path to generate car uploads for.
 * @param {import('ora').Ora} view
 * @returns {Promise<void>}
 */
export async function uploadExistingCar(filePath, view) {
  try {
    const { size } = await fs.promises.stat(filePath)
    if (size > MAX_CAR_SIZE) {
      const maxSizeMB = (MAX_CAR_SIZE / 1000000).toFixed(2)
      const sizeMB = (size / 1000000).toFixed(2)

      const text = `Attempted to upload a file of size ${sizeMB}MB, max size is ${maxSizeMB}MB`
      view.fail(text)
      throw new Error(text)
    }
    const buffer = await fs.promises.readFile(resolvePath(filePath))

    const response = await client.upload(buffer)
    if (response) {
      view.succeed(`${response}`)
    }
  } catch (err) {
    view.fail('Upload did not complete successfully, check w3up-failure.log')
    logToFile('upload', err)
  }
}

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

  //TODO: implement pool pattern
  let done = false
  while (!done) {
    const read = await reader.read().then(async (read) => {
      await uploadExistingCar(read.value, view)
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
  description: 'Walk a file directory, and upload any found cars to an account',
  build,
  exe,
  exampleIn: '$0 upload-cars ducks/',
  exampleOut: `<show all cars uploaded>`,
}

export default bulkUpload
