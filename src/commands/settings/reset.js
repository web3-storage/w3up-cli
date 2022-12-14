import { clearSettings, getClient } from '../../client.js'
import Inquirer from 'inquirer'
import ora from 'ora'

/**
 * @typedef {{profile?: string}} ResetSettings
 * @typedef {import('yargs').Arguments<ResetSettings>} ResetSettingsArgs
 */

/**
 * @param {ResetSettingsArgs} args
 * @returns {Promise<void>}
 */
const handler = async (args) => {
  const view = ora('reset')
  view.stopAndPersist({
    text: `This will delete your settings, are you sure?
  You will lose access to anything created with your previous key/did.
  If you want to keep the previous settings, use export-settings first.
`
  })

  const client = getClient(args.profile)

  const { reset } = await Inquirer.prompt({
    name: 'reset',
    type: 'confirm',
    default: false
  })
  if (reset) {
    clearSettings(client, args.profile)
    view.succeed('Settings cleared.')
  } else {
    view.info('exiting')
  }
}

export default {
  command: 'reset',
  describe: 'Delete all local settings',
  builder: {},
  handler,
  exampleOut: 'Settings cleared.',
  exampleIn: '$0 reset-settings'
}
