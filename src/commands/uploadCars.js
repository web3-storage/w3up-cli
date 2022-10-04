import fs from 'fs'
import ora from 'ora'
import path from 'path'
// @ts-ignore
import toIterator from 'stream-to-it'

import { getClient } from '../client.js'
import { getAllFiles, isDirectory } from '../lib/car/file.js'
import { logToFile } from '../lib/logging.js'
import { MAX_CAR_SIZE } from '../settings.js'
import {
  checkPath,
  hasID,
  hasSetupAccount,
  isCarFile,
  resolvePath,
} from '../validation.js'

//gotta start somewhere. 3 is fine.
const MAX_CONNECTION_POOL_SIZE = 3

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
 * @typedef {{path?:string, profile?:string}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 */

/**
 * @async
 * @param {UploadArgs} argv
 * @returns {Promise<void>}
 */
const exe = async (argv) => {
  const _path = argv.path
  const view = ora({
    text: `Uploading all cars within ${_path}...`,
    spinner: 'line',
  }).start()

  if (!_path) {
    return Promise.reject('You must Specify a Path')
  }

  const targetPath = path.resolve(_path)

  if (!isDirectory(targetPath)) {
    return Promise.reject('Path must be directory for bulk uploads.')
  }

  const stream = new TransformStream(
    {},
    { highWaterMark: 1 },
    { highWaterMark: 1 }
  )
  const writer = stream.writable.getWriter()

  let files = getAllFiles(targetPath)

  for (const file of files) {
    const _file = path.resolve(targetPath, file)
    if (isDirectory(_file)) {
      continue
    }
    if (!isCarFile(_file)) {
      continue
    }

    writer.write(path.join(_file))
  }

  for await (const car of toIterator(stream.readable)) {
    uploadExistingCar(car, view)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) => yargs.check(hasSetupAccount).check(checkPath)

export default {
  command: ['upload-cars <path>'],
  describe: 'Walk a file directory, and upload any found cars to an account',
  builder,
  handler: exe,
  exampleIn: '$0 upload-cars ducks/',
  exampleOut: `<show all cars uploaded>`,
}
