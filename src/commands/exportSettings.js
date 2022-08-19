import ora from 'ora'
import Inquirer from 'inquirer'
import { settings } from '../client.js'

/**
 * @async
 * @returns {Promise<void>}
 */
const exe = async () => {
  const view = ora('export')

  view.stopAndPersist({
    text: 'These values give anyone the power to act as you, are you sure you want to print them?',
  })

  const { show } = await Inquirer.prompt({
    name: 'show',
    type: 'confirm',
  })

  if (show) {
    const store = settings.store
    if (store.secret) {
      store.secret = Buffer.from(store.secret).toString('base64')
    }
    console.log(store)
  } else {
    console.log('exiting')
  }
}

const exportSettings = {
  cmd: 'export-settings',
  description: 'Export a settings.json file',
  build: {},
  exe,
  exampleOut: `DID:12345`,
  exampleIn: '$0 export-settings',
}

export default exportSettings
