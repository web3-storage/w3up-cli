import generate from './generate.js'
import inspect from './inspect.js'

export default {
  command: 'car <cmd>',
  describe: 'CAR file specific commands',
  builder: (yargs) => yargs.command([generate, inspect]),
  handler: () => {},
}
