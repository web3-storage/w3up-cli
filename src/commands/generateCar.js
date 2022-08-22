import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'
import { buildCar } from '../lib/car.js'

import * as DAG_PB from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'

/**
 * @typedef {{filePath?:string, outPath?:string }} GenerateCar
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

async function bytesToDAGPBCID(bytes) {
  // this CID represents the byte content, but doesn't 'link' with the blocks inside
  const digest = await sha256.digest(bytes)
  return CID.createV1(DAG_PB.code, digest)
}

/**
 * @async
 * @param {GenerateCarArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ filePath, outPath = 'output.car' }) => {
  const view = ora({
    text: `Generating Car from ${filePath}...`,
    spinner: 'line',
  }).start()

  const { buffers, max_car_size } = await buildCar(filePath)

  //   const reader = buffers.readable.getReader()

  //   function writeBufferToFile({ done, value }) {
  //     if (!done) {
  //       console.log('read', value)
  //       reader.read().then(writeBufferToFile)
  //     } else {
  //       console.log('done')
  //     }
  //   }
  //   await reader.read().then(writeBufferToFile)

  if (buffers && buffers.length) {
    console.log(
      `writing to ${buffers.length} files, max car size is ${max_car_size}`
    )
    await Promise.all(
      buffers.map(async (b, i) => {
        const bytes = await b.close()
        const cid = await bytesToDAGPBCID(bytes)
        await writeFileLocally(bytes, `${cid}.car.${i}`)

        view.succeed(`CAR created ${filePath} => ${cid}.car.${i}`)
      })
    )
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
