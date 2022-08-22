import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'

import { buildCar } from '../lib/car.js'
import { check } from 'yargs'

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

  const car = await buildCar(filePath)
  if (car) {
    await writeFileLocally(car, outPath)
    view.succeed(`CAR created ${filePath} => ${outPath}`)
  } else {
    view.fail('Car generation failed.')
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
