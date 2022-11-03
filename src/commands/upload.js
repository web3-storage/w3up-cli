// @ts-ignore
// eslint-disable-next-line no-unused-vars
import { CID } from 'multiformats/cid'
import ora from 'ora'
import path from 'path'
// @ts-ignore
import toIterator from 'stream-to-it'

import { getClient } from '../client.js'
import { buildCar } from '../lib/car/buildCar.js'
import { logToFile } from '../lib/logging.js'
import { bytesToCarCID } from '../utils.js'
import { checkPath, hasSetupAccount } from '../validation.js'

/**
 * @typedef {{path?: string, split?: boolean, profile?: string}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 */

/**
 * @param {string} filePath - The path to generate car uploads for.
 * @param {import('ora').Ora} view
 * @param {string} [profile]
 * @returns {Promise<void>}
 */
async function generateCarUploads (filePath, view, chunkSize = 512, profile) {
  const client = getClient(profile)

  chunkSize = Math.pow(1024, 2) * chunkSize
  const resolvedPath = path.resolve(filePath)
  try {
    const { stream } = await buildCar(resolvedPath, chunkSize, false)
    /** @type Array<CID> */
    let roots = []
    /** @type Array<CID> */
    let cids = []
    let origin = null

    for await (const car of toIterator(stream)) {
      roots = roots.concat(car.roots)
      const cid = await bytesToCarCID(car.bytes)
      cids.push(cid)

      const result = await client.upload(car.bytes, origin)
      if (result.error) {
        // @ts-expect-error
        throw new Error(result?.cause?.message)
      }
      view.succeed(result)
      origin = cid
    }

    const uploadAddResult = await client.uploadAdd(roots[0], cids)
    // @ts-expect-error
    if (uploadAddResult.error) {
      // @ts-expect-error
      throw new Error(uploadAddResult?.cause?.message)
    }

    console.log('data CIDs:\n', roots.map((x) => x.toString()).join('\n'))
    console.log('upload chunk(s) identifier:\n', cids.map((x) => x.toString()).join('\n'))

    if (roots && roots.length) {
      console.log(`IPFS Gateway url:\n https://w3s.link/ipfs/${roots[0].toString()}`)
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
const handler = async (argv) => {
  const _path = argv.path
  const chunkSize = Number(argv.chunkSize) || 512

  if (chunkSize < 1 || chunkSize > 512) {
    return Promise.reject(new Error('Chunk size must be between 1 and 512'))
  }

  if (!_path) {
    return Promise.reject(new Error('You must Specify a Path'))
  }

  if (path.extname(_path) === '.car') {
    console.warn(
      'Your upload is already .car format\nYou may need the upload-cars command for existing .car files. This will wrap your .car file in another .car file'
    )
  }
  const view = ora({ text: `Uploading ${_path}...`, spinner: 'line' }).start()

  await generateCarUploads(_path, view, chunkSize, argv.profile)
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) =>
  yargs
    .check(hasSetupAccount)
    .check(checkPath)
    .option('chunk-size', {
      type: 'number'
    })
    .option('split', {
      type: 'boolean',
      alias: 'split',
      showInHelp: true,
      describe: 'Split the data into multiple when cars when size limit is hit.'
    })

export default {
  //   command: ['upload <path>', 'import <path>'],
  command: ['upload <path>'],
  describe: 'Upload any file or directory to your account',
  builder,
  handler,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: 'uploaded bafy...'
}
