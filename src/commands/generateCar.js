import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import path from 'path'
import fs from 'fs'
import { buildCar } from '../lib/car.js'

import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'

// const MAX_CAR_SIZE = 32000000 //32MB
// const MAX_CAR_SIZE= 256000000 //256MB
export const MAX_CAR_SIZE = 3800000000 //3.8GB

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
const exe = async ({ filePath, outPath = 'output.car' }) => {
  const resolvedPath = path.resolve('.', filePath)

  /** @type import('ora').Options */
  const oraOpts = {
    text: `Generating Car from ${resolvedPath}`,
    spinner: 'line',
  }
  const view = ora(oraOpts).start()

  try {
    const { stream, _reader } = await buildCar(resolvedPath, MAX_CAR_SIZE, true)
    /** @type Array<CID> */
    let roots = []

    _reader.catch((err) => {
      view.fail(
        err.toString() +
          '\n current max size is: ' +
          (MAX_CAR_SIZE / 1000000).toFixed(2) +
          'MB'
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
    view.fail(err.toString())
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) => yargs.check(checkPath)

/**
 * @param {GenerateCarArgs} argv
 */
const checkPath = ({ filePath, outPath }) => isPath(filePath)

const generateCar = {
  cmd: 'generate-car <filePath> [outPath]',
  description: 'From an input file, locally generate a CAR file.',
  build,
  exe,
  exampleIn: '$0 generate-car ../duck.png duck.car',
  exampleOut: `CAR created ../duck.png => duck.car`,
}

export default generateCar
