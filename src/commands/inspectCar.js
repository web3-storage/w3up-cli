import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'
import { run as carToDot } from '../lib/info/carToDot.js'
import { run as carToList } from '../lib/info/carToList.js'
import { run as carToTree } from '../lib/info/carToTree.js'

/**
 * @typedef {{path?:string, dot?:boolean, vertical?:boolean}} CarInfo
 * @typedef {import('yargs').Arguments<CarInfo>} CarInfoArgs
 */

// do not use ora for output, so it can be piped to dot/etc for building image.
/**
 * @async
 * @param {CarInfoArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({
  path = '/',
  dot = false,
  vertical = false,
  tree = false,
}) => {
  const buffer = fs.readFileSync(resolvePath(path))

  if (dot) {
    console.log(await carToDot(buffer, vertical))
  } else if (tree) {
    console.log(await carToTree(buffer))
  } else {
    console.log(await carToList(buffer))
  }
}
/**
 * @type {import('yargs').CommandBuilder} yargs
 */
const build = (yargs) =>
  yargs
    .check(checkPath)
    .option('tree', {
      type: 'boolean',
      showInHelp: true,
      describe: 'output the car as a tree on the command line',
    })
    .option('dot', {
      type: 'boolean',
      showInHelp: true,
      describe: 'output the car as a DOT graph.',
    })
    .option('vertical', {
      type: 'boolean',
      showInHelp: true,
      describe: 'set rankdir LR',
    })

/**
 * @param {CarInfoArgs} argv
 */
const checkPath = ({ path }) => isPath(path)

const upload = {
  cmd: 'inspect-car <path>',
  description: 'Generate an examination file from a <path> to a CAR ',
  build,
  exe,
  exampleIn: '$0 car-info ../duck.car',
  exampleOut: `generated examination string (can be piped)`,
}

export default upload
