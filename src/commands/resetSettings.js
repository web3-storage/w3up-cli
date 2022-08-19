import ora from 'ora'
import Inquirer from 'inquirer'
import { settings } from '../client.js'

/**
 * @async
 * @returns {Promise<void>}
 */
const exe = async () => {
  const view = ora('reset')
  view.stopAndPersist({
    text: `This will delete your settings, are you sure?
You will lose access to anything created with your previous key/did.
`,
  })

  const { reset } = await Inquirer.prompt({
    name: 'reset',
    type: 'confirm',
  })

  if (reset) {
    settings.clear()
    console.log('Settings cleared.')
  } else {
    console.log('exiting')
  }
}

const resetSettings = {
  cmd: 'reset-settings',
  description: 'Delete all local settings',
  build: {},
  exe,
  exampleOut: `Settings cleared.`,
  exampleIn: '$0 reset-settings',
}

export default resetSettings
