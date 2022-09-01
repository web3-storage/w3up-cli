import client from '../client.js'
import ora from 'ora'
import fs from 'fs'
import path from 'path'
// @ts-ignore
import { CID } from 'multiformats/cid'

import { MAX_CAR_SIZE } from '../settings.js'
import { logToFile } from '../lib/logging.js'
import { buildCar } from '../lib/car/buildCar.js'
import { hasID, isPath, resolvePath } from '../validation.js'
import { bytesToCarCID } from '../utils.js'

/**
 * @typedef {{path?:string, split?:boolean}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 */

/**
 * @async
 * @param {string} filePath - The path to generate car uploads for.
 * @param {import('ora').Ora} view
 * @param {boolean} split - The path to generate car uploads for.
 * @returns {Promise<void>}
 */
async function generateCarUploads(filePath, view, split) {
  const resolvedPath = path.resolve(filePath)
  try {
    const { stream } = await buildCar(resolvedPath, MAX_CAR_SIZE, split != true)
    const reader = stream.getReader()
    /** @type Array<CID> */
    let roots = []
    let count = 0
    let rootCarCID = ''

    async function* iterator() {
      while (true) {
        yield reader.read()
      }
    }

    for await (const { value, done } of iterator()) {
      if (done) {
        break
      }

      count++

      roots = roots.concat(value.roots)
      if (value.roots) {
        rootCarCID = await bytesToCarCID(value.bytes)
      }
      const response = await client.upload(value.bytes)
      view.succeed(response)
    }

    console.log('roots:\n', roots.map((x) => x.toString()).join('\n'))
    if (count > 1) {
      console.log('root car:\n', rootCarCID?.toString())
    }
  } catch (err) {
    view.fail('Upload did not complete successfully, check w3up-failure.log')
    logToFile('upload', err)
  }
}

/**
 * @async
 * @param {string} filePath - The path to generate car uploads for.
 * @param {import('ora').Ora} view
 * @returns {Promise<void>}
 */
async function uploadExistingCar(filePath, view) {
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
 * @async
 * @param {UploadArgs} argv
 * @returns {Promise<void>}
 */
const exe = async (argv) => {
  const _path = argv.path
  const split = argv.split
  const view = ora({ text: `Uploading ${_path}...`, spinner: 'line' }).start()

  if (!_path) {
    return Promise.reject('You must Specify a Path')
  }

  if (path.extname(_path) !== '.car') {
    await generateCarUploads(_path, view, split || false)
  } else {
    await uploadExistingCar(_path, view)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) =>
  yargs
    .check(() => hasID())
    .check(checkPath)
    .option('split', {
      type: 'boolean',
      alias: 'split',
      showInHelp: true,
      describe:
        'Split the data into multiple when cars when size limit is hit.',
    })

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

const upload = {
  cmd: ['upload <path>', 'import <path>'],
  description: 'Upload a file or directory to your account',
  build,
  exe,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: `uploaded bafy...`,
}

export default upload
