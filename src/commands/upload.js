import fs from 'fs'
// @ts-ignore
import { CID } from 'multiformats/cid'
import ora from 'ora'
import path from 'path'
// @ts-ignore
import toIterator from 'stream-to-it'

import { getClient } from '../client.js'
import { buildCar } from '../lib/car/buildCar.js'
import { logToFile } from '../lib/logging.js'
import { bytesToCarCID } from '../utils.js'
import { checkPath, hasID, hasSetupAccount } from '../validation.js'

/**
 * @typedef {{path?: string;split?: boolean; profile: string}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 * @async
 * @param {string} filePath - The path to generate car uploads for.
 * @param {import('ora').Ora} view
 * @param {boolean} [split] - The path to generate car uploads for.
 * @param {string} [profile]
 * @returns {Promise<void>}
 */
async function generateCarUploads(
  filePath,
  view,
  split = false,
  chunkSize = 512,
  profile
) {
  chunkSize = Math.pow(1024, 2) * chunkSize
  const resolvedPath = path.resolve(filePath)
  try {
    const { stream } = await buildCar(resolvedPath, chunkSize, false)
    /** @type Array<CID> */
    let roots = []
    /** @type Array<CID> */
    let cids = []
    let count = 0
    let rootCarCID

    const uploadPromises = []

    for await (const car of toIterator(stream)) {
      count++
      roots = roots.concat(car.roots)
      if (car.roots && car.roots?.length > 0) {
        rootCarCID = await bytesToCarCID(car.bytes)
      } else {
        cids.push(await bytesToCarCID(car.bytes))
      }

      const client = getClient(profile)
      /**
       * @type any
       */
      await client.upload(car.bytes).then((response) => {
        view.succeed(response)
      })
    }

    console.log('data CIDs:\n', roots.map((x) => x.toString()).join('\n'))
    if (count > 1) {
      console.log('root car:\n', rootCarCID?.toString())
      console.log('shard cars:\n', cids.join('\n '))
      //       console.log('linking other cars:', cids)
      //       const linkingResponse = await client.linkcars(rootCarCID, cids)
      //       console.log('other', linkingResponse)
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
  const split = argv.split
  const chunkSize = argv.chunkSize || 512

  if (chunkSize < 1 || chunkSize > 512) {
    return Promise.reject('Chunk size must be between 1 and 512')
  }

  if (!_path) {
    return Promise.reject('You must Specify a Path')
  }

  if (path.extname(_path) === '.car') {
    console.warn(
      `Your upload is already .car format\nYou may need the upload-cars command for existing .car files. This will wrap your .car file in another .car file`
    )
  }
  const view = ora({ text: `Uploading ${_path}...`, spinner: 'line' }).start()

  await generateCarUploads(_path, view, split, chunkSize, argv.profile)
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
      type: 'number',
    })
    .option('split', {
      type: 'boolean',
      alias: 'split',
      showInHelp: true,
      describe:
        'Split the data into multiple when cars when size limit is hit.',
    })

export default {
  //   command: ['upload <path>', 'import <path>'],
  command: ['upload <path>'],
  describe: 'Upload any file or directory to your account',
  builder,
  handler,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: `uploaded bafy...`,
}
