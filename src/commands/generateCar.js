import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import path from 'path'
import fs from 'fs'
import { buildCar } from '../lib/car.js'

import * as DAG_PB from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as CAR from '@ucanto/transport/car'

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
 * @param {Uint8Array} bytes - The bytes to get a DAG_PB cid for.
 * @returns {Promise<CID>}
 */
async function bytesToDAGPBCID(bytes) {
  // this CID represents the byte content, but doesn't 'link' with the blocks inside
  const digest = await sha256.digest(bytes)
  return CID.createV1(DAG_PB.code, digest)
}

async function sleep(time) {
  return new Promise((res, rej) => setTimeout(res, time))
}

/**
 * @async
 * @param {GenerateCarArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ filePath, outPath = 'output.car' }) => {
  const p = path.resolve('.', filePath)
  const oraOpts = {
    text: `Generating Car from ${p}`,
    spinner: 'line',
  }
  const view = ora(oraOpts).start()

  const carsize = 33554432 * 8 //32MB * 8 = 256MB
  const stream = await buildCar(p, carsize)

  /**
   * @param {ReadableStreamDefaultReadResult<any>} block
   * @returns {Promise<void>}
   */
  async function writeBufferToFile({ done, value }) {
    if (value) {
      //       const cid = await bytesToDAGPBCID(value)
      const cid = await CAR.codec.link(value)
      writeFileLocally(value, `${cid}.car`)
      view.succeed(`CAR created ${p} => ${cid}.car`)
    }

    if (!done) {
      view.start(oraOpts.text)
      await stream.read().then(writeBufferToFile)
    } else {
      view.stop()
    }
  }
  await stream.read().then(writeBufferToFile)
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
