import ora from 'ora'
import path from 'path'
import fs from 'fs'
// @ts-ignore
import { CID } from 'multiformats/cid'
// @ts-ignore
import { sha256 } from 'multiformats/hashes/sha2'

import { isPath, resolvePath } from '../validation.js'
import { buildCar } from '../lib/car.js'
import { logToFile } from '../lib/logging.js'
import { MAX_CAR_SIZE } from '../settings.js'
import { humanizeBytes } from '../utils.js'

/**
 * @typedef {{filePath:string, outPath?:string }} GenerateCar
 * @typedef {import('yargs').Arguments<GenerateCar>} GenerateCarArgs
 */

/**
 *
 * @param {any} car
 * @param {string} outPath
 * @returns {Promise<any>}
 */
export const writeFileLocally = async (car, outPath = 'output.car') => {
  return fs.promises.writeFile(resolvePath(outPath), car, {
    encoding: 'binary',
  })
}

/**
 * @async
 * @param {Uint8Array} bytes - The bytes to get a CAR cid for.
 * @returns {Promise<CID>}
 */
export async function bytesToCarCID(bytes) {
  // this CID represents the byte content, but doesn't 'link' with the blocks inside
  const digest = await sha256.digest(bytes)
  return CID.createV1(0x202, digest)
}

/**
 * @async
 * @param {GenerateCarArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ filePath, outPath = 'output.car', split = false }) => {
  const resolvedPath = path.normalize(filePath)

  /** @type import('ora').Options */
  const oraOpts = {
    text: `Generating Car from ${resolvedPath}`,
    spinner: 'line',
  }
  const view = ora(oraOpts).start()

  try {
    const { stream, _reader } = await buildCar(
      resolvedPath,
      MAX_CAR_SIZE,
      !split
    )
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
    async function writeBufferToFile({ done, value }) {
      if (value && value.bytes) {
        roots = roots.concat(value.roots)
        const cid = await bytesToCarCID(value.bytes)
        writeFileLocally(value.bytes, `${cid}.car`)
        view.succeed(`CAR created ${resolvedPath} => ${cid}.car`)
      }

      if (!done) {
        view.start(oraOpts.text)
        await stream.read().then(writeBufferToFile)
      } else {
        view.stop()
        console.log('roots:\n', roots.map((x) => x.toString()).join('\n'))
      }
    }
    await stream.read().then(writeBufferToFile)
  } catch (err) {
    // @ts-ignore
    view.fail(err.toString())
    logToFile('generate-car', err)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) =>
  yargs.check(checkPath).option('split', {
    type: 'boolean',
    alias: 'split',
    showInHelp: true,
    describe: 'Split the data into multiple when cars when size limit is hit.',
  })

/**
 * @param {GenerateCarArgs} argv
 */
const checkPath = ({ filePath }) => isPath(filePath)

const generateCar = {
  cmd: 'generate-car <filePath> [outPath]',
  description: 'From an input file, locally generate a CAR file.',
  build,
  exe,
  exampleIn: '$0 generate-car ../duck.png duck.car',
  exampleOut: `CAR created ../duck.png => duck.car`,
}

export default generateCar
