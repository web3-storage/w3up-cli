import list from './list.js'
import remove from './remove.js'

export default {
  command: 'uploads <cmd>',
  describe: 'Manage uploads',
  handler: () => {},
  builder: (yargs) =>
    yargs.command([list, remove]).command({
      ...list,
      command: '*',
    }),
}
