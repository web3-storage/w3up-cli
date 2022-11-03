import { buildCar } from '../../lib/car/buildCar.js'
import { logToFile } from '../../lib/logging.js'
import { MAX_CAR_SIZE } from '../../settings.js'
import { bytesToCarCID } from '../../utils.js'
import { isPath, resolvePath } from '../../validation.js'
import fs from 'fs'
// @ts-ignore
// eslint-disable-next-line no-unused-vars
import { CID } from 'multiformats/cid'
import ora from 'ora'
import path from 'path'
// @ts-ignore
import toIterator from 'stream-to-it'

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
    encoding: 'binary'
  })
}

/**
 * @async
 * @param {GenerateCarArgs} argv
 * @returns {Promise<void>}
 */
const handler = async ({ filePath = '', split = false }) => {
  const resolvedPath = path.normalize(filePath)

  /** @type import('ora').Options */
  const oraOpts = {
    text: `Generating Car from ${resolvedPath}`,
    spinner: 'line'
  }
  const view = ora(oraOpts).start()

  try {
    const { stream } = await buildCar(resolvedPath, MAX_CAR_SIZE, !split)
    /** @type Array<CID> */
    let roots = []

    /** @type CID | null */
    let rootCarCID = null
    const carCIDS = []
    let count = 0

    for await (const car of toIterator(stream)) {
      count++
      roots = roots.concat(car.roots)
      bytesToCarCID(car.bytes).then((cid) => {
        if (car.roots) {
          rootCarCID = cid
        } else {
          carCIDS.push(cid)
        }
        writeFileLocally(car.bytes, `${cid}.car`)
        view.succeed(`CAR created ${resolvedPath} => ${cid}.car`)
      })
    }

    view.stop()
    console.log('roots:\n', roots.map((x) => x.toString()).join('\n'))
    if (count > 1) {
      // @ts-ignore
      console.log('root car:\n', rootCarCID?.toString())
      // TODO:
      // client.link()
    }
  } catch (err) {
    // @ts-ignore
    view.fail(err.toString())
    logToFile('generate-car', err)
    process.exit(1) // force exit in case other async things are running.
  }
}

/** @type {import('yargs').CommandBuilder} yargs */
const builder = (yargs) =>
  yargs.check(checkPath).option('split', {
    type: 'boolean',
    alias: 'split',
    showInHelp: true,
    describe: 'Split the data into multiple when cars when size limit is hit.'
  })

/**
 * @param {GenerateCarArgs} argv
 */
const checkPath = ({ filePath }) => isPath(filePath)

export default {
  command: 'generate <filePath>',
  describe: 'From an input file, locally generate a CAR file.',
  builder,
  handler,
  exampleIn: '$0 generate-car ../duck.png duck.car',
  exampleOut: 'CAR created ../duck.png => duck.car'
}
