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

/**
 * @typedef {object} GenerateCar
 * @property {string} [filePath='']
 * @property {boolean} [split=false]
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
const exe = async ({ filePath = '', split = false }) => {
  const resolvedPath = path.normalize(filePath)

  /** @type import('ora').Options */
  const oraOpts = {
    text: `Generating Car from ${resolvedPath}`,
    spinner: 'line',
  }
  const view = ora(oraOpts).start()

  try {
    const { stream } = await buildCar(resolvedPath, MAX_CAR_SIZE, !split)
    /** @type Array<CID> */
    let roots = []

    async function* iterator() {
      let next = await stream.read()
      while (!next?.done) {
        yield next
        next = await stream.read()
      }
    }

    for await (const { value, done } of iterator()) {
      roots = roots.concat(value.roots)
      bytesToCarCID(value.bytes).then((cid) => {
        writeFileLocally(value.bytes, `${cid}.car`)
        view.succeed(`CAR created ${resolvedPath} => ${cid}.car`)
      })
    }
    view.stop()
    console.log('roots:\n', roots.map((x) => x.toString()).join('\n'))
  } catch (err) {
    // @ts-ignore
    view.fail(err.toString())
    logToFile('generate-car', err)
    process.exit(1) //force exit in case other async things are running.
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
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
  cmd: 'generate-car <filePath>',
  description: 'From an input file, locally generate a CAR file.',
  build,
  exe,
  exampleIn: '$0 generate-car ../duck.png duck.car',
  exampleOut: `CAR created ../duck.png => duck.car`,
}

export default generateCar
