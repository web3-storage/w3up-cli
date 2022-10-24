import createDelegation from './to.js'
import importDelegation from './import.js'
import listDelegations from './list.js'
import switchDelegation from './switch.js'

export default {
  command: 'delegate <cmd>',
  describe: 'Manage delegations',
  handler: () => {},
  builder: (yargs) =>
    yargs.command([
      createDelegation,
      importDelegation,
      listDelegations,
      switchDelegation,
    ]),
}
