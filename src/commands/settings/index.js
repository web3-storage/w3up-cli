import exportSettings from './export.js'
import importSettings from './import.js'
import resetSettings from './reset.js'

export default {
  command: 'settings <cmd>',
  describe: 'Manage settings',
  handler: () => {},
  // @ts-expect-error
  builder: (yargs) =>
    yargs.command([exportSettings, importSettings, resetSettings]),
}
