import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'
import { run as carToDot } from '../lib/carToDot.js'

/**
 * @typedef {{path?:string, vertical?:boolean}} CarToDot
 * @typedef {import('yargs').Arguments<CarToDot>} CarToDotArgs
 */

// do not use ora for output, so it can be piped to dot/etc for building image.
/**
 * @async
 * @param {CarToDotArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ path = '/', vertical = false }) => {
  const buffer = fs.readFileSync(resolvePath(path))
  const info = await carToDot(buffer, vertical)
  console.log(info)
}
/**
 * @type {import('yargs').CommandBuilder} yargs
 */
const build = (yargs) =>
  yargs.check(checkPath).option('vertical', {
    type: 'boolean',
    showInHelp: true,
    describe: 'set rankdir LR',
  })

/**
 * @param {CarToDotArgs} argv
 */
const checkPath = ({ path }) => isPath(path)

const upload = {
  cmd: 'car-to-dot <path>',
  description: 'Generate an examination file from a <path> to a CAR ',
  build,
  exe,
  exampleIn: '$0 car-to-dot ../duck.car',
  exampleOut: `generated examination file`,
}

export default upload
