import list from './list.js'
import remove from './remove.js'

export default {
  command: 'store <cmd>',
  describe: 'Manage car files in w3up.',
  handler: () => {},
  builder: (yargs) => yargs.command([list, remove]),
}
