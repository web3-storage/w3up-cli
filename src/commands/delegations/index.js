import importDelegation from './import.js'
import listDelegations from './list.js'
import switchDelegation from './switch.js'
import createDelegation from './to.js'

export default {
  command: 'delegate <cmd>',
  describe: 'Manage delegations',
  handler: () => {},
  // @ts-expect-error
  builder: (yargs) =>
    yargs.command([
      createDelegation,
      importDelegation,
      listDelegations,
      switchDelegation,
    ]),
}
