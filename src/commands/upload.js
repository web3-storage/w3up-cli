import client from '../client.js'
import ora from 'ora'
import fs from 'fs'
import path from 'path'
// @ts-ignore
import { CID } from 'multiformats/cid'

import { MAX_CAR_SIZE } from '../settings.js'
import { logToFile } from '../lib/logging.js'
import { buildCar } from '../lib/car.js'
import { hasID, isPath, resolvePath } from '../validation.js'
import { humanizeBytes } from '../utils.js'

/**
 * @typedef {{path?:string}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 */

/**
 * @async
 * @param {string} filePath - The path to generate car uploads for.
 * @param {import('ora').Ora} view
 * @returns {Promise<void>}
 */
async function generateCarUploads(filePath, view) {
  const resolvedPath = path.resolve(filePath)
  try {
    const { stream, _reader } = await buildCar(resolvedPath, MAX_CAR_SIZE, true)
    /** @type Array<CID> */
    let roots = []

    _reader.catch((err) => {
      view.fail(
        err.toString() +
          '\n current max size is: ' +
          humanizeBytes(MAX_CAR_SIZE)
      )
      process.exit(1)
    })

    /**
     * @param {ReadableStreamDefaultReadResult<any>} block
     * @returns {Promise<void>}
     */
    async function uploadBuffer({ done, value }) {
      if (value && value.bytes) {
        roots = roots.concat(value.roots)
        const response = await client.upload(value.bytes)
        view.succeed(response)
      }

      if (!done) {
        await stream.read().then(uploadBuffer)
      } else {
        console.log('roots:\n', roots.map((x) => x.toString()).join('\n'))
      }
    }
    await stream.read().then(uploadBuffer)
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
  if (!_path) {
    return Promise.reject('You must Specify a Path')
  }
  if (path.extname(_path) === '.car') {
    console.warn(
      `Your upload is already .car format\nYou may need the upload-cars command for existing .car files. This will wrap your .car file in another .car file`
    )
  }
  const view = ora({ text: `Uploading ${_path}...`, spinner: 'line' }).start()
  await generateCarUploads(_path, view)
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

const upload = {
  cmd: ['upload <path>', 'import <path>'],
  description: 'Upload any file or directory to your account',
  build,
  exe,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: `uploaded bafy...`,
}

export default upload
