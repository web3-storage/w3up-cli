import fs from 'fs'

import { run as carToDot } from '../lib/info/carToDot.js'
import { run as carToList } from '../lib/info/carToList.js'
import { run as carToTree } from '../lib/info/carToTree.js'
import { isPath, resolvePath } from '../validation.js'

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
const handler = async ({
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
const builder = (yargs) =>
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

export default {
  command: 'inspect-car <path>',
  describe: 'Generate an examination file from a <path> to a CAR ',
  builder,
  handler,
  exampleIn: '$0 inspect-car ../duck.car --tree',
  exampleOut: `roots
└─┬ bafy...
  └── duck.png`,
}
