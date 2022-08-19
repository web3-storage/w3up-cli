import ora from 'ora'
import fs from 'fs'
import Inquirer from 'inquirer'
import { settings } from '../client.js'

/**
 * @async
 * @returns {Promise<void>}
 */
const exe = async (argv) => {
  const { filename } = argv
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

    const settingsJson = JSON.stringify(store, null, 2);
    if(filename) {
      fs.writeFileSync(filename, settingsJson)
      console.log('Settings written to:', filename);
    } else {
      console.log('No file name provided, printing config to console:\n', settingsJson);
    }
  } else {
    console.log('exiting')
  }
}

const exportSettings = {
  cmd: 'export-settings [filename]', //[] means optional arg.
  description: 'Export a settings json file',
  build: {},
  exe,
  exampleOut: `DID:12345`,
  exampleIn: '$0 export-settings',
}

export default exportSettings
