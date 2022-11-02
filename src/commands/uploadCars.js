import { getClient } from '../client.js'
import { getAllFiles, isDirectory } from '../lib/car/file.js'
import { logToFile } from '../lib/logging.js'
import { MAX_CAR_SIZE } from '../settings.js'
import { bytesToCarCID } from '../utils.js'
import {
  checkPath,
  hasSetupAccount,
  isCarFile,
  resolvePath
} from '../validation.js'
// @ts-ignore
import * as CAR from '@ipld/car'
import fs from 'fs'
import ora from 'ora'
import path from 'path'
// @ts-ignore
import toIterator from 'stream-to-it'

// gotta start somewhere. 3 is fine.
// const MAX_CONNECTION_POOL_SIZE = 3

/**
 * @async
 * @param {string} filePath - The path to generate car uploads for.
 * @param {any} client - The client to upload with.
 * @param {import('ora').Ora} view
 * @returns {Promise<Buffer|void>}
 */
export async function uploadExistingCar (filePath, client, view) {
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
      return buffer
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
const handler = async (argv) => {
  const _path = argv.path
  const view = ora({
    text: `Uploading ${_path}...`,
    spinner: 'line'
  }).start()

  const client = getClient(argv.profile)

  if (!_path) {
    return Promise.reject(new Error('You must Specify a Path'))
  }

  const targetPath = path.resolve(_path)

  // eslint-disable-next-line no-undef
  const stream = new TransformStream(
    {},
    { highWaterMark: 1 },
    { highWaterMark: 1 }
  )
  const writer = stream.writable.getWriter()

  const files = getAllFiles(targetPath)

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
    uploadExistingCar(car, client, view).then(async (buffer) => {
      if (buffer) {
        const bytes = Uint8Array.from(buffer)
        const reader = await CAR.CarReader.fromBytes(bytes)
        const roots = await reader.getRoots()
        const cid = await bytesToCarCID(bytes)
        for (const root of roots) {
          await client.uploadAdd(root, [cid])
        }
      }
    })
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
  handler,
  exampleIn: '$0 upload-cars ducks/',
  exampleOut: '<show all cars uploaded>'
}
