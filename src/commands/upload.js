import client from '../client.js'
import ora from 'ora'
import { hasID, isPath, resolvePath } from '../validation.js'
import fs from 'fs'
import path from 'path'
import { buildCar } from '../lib/car.js'
import { CID } from 'multiformats/cid'
import { MAX_CAR_SIZE } from './generateCar.js'

/**
 * @typedef {{path?:string}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 */

async function generateCarUploads(filePath, view) {
  const resolvedPath = path.resolve('.', filePath)
  try {
    const { stream, _reader } = await buildCar(resolvedPath, MAX_CAR_SIZE, true)
    /** @type Array<CID> */
    let roots = []

    _reader.catch((err) => {
      throw new Error(
        err.toString() +
          '\n current max size is: ' +
          (MAX_CAR_SIZE / 1000000).toFixed(2) +
          'MB'
      )
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
    await fs.promises.appendFile('w3up-failure.log', JSON.stringify(err) + '\n')
  }
}

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

  //TODO: automatically convert to a car
  if (path.extname(_path) !== '.car') {
    await generateCarUploads(_path, view)
  } else {
    try {
      const buffer = await fs.promises.readFile(resolvePath(_path))

      const response = await client.upload(buffer)
      if (response) {
        view.succeed(`${response}`)
      }
    } catch (err) {
      view.fail('Upload did not complete successfully, check w3up-failure.log')
      await fs.promises.appendFile(
        'w3up-failure.log',
        JSON.stringify(err) + '\n'
      )
    }
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

const upload = {
  cmd: ['upload <path>', 'import <path>'],
  description: 'Upload a file or directory to your account',
  build,
  exe,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: `uploaded bafy...`,
}

export default upload
