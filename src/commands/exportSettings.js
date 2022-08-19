import ora from 'ora'
import fs from 'fs'
import Inquirer from 'inquirer'
import { settings } from '../client.js'
import { isPath, resolvePath } from '../validation.js'

/**
 * Export settings by printing to console or writing to a json file.
 * @async
 * @param {object} argv
 * @param {string} [argv.filename] - The file to write the settings to
 * @returns {Promise<void>}
 */
const exe = async ({ filename }) => {
  const view = ora().start()

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

    const settingsJson = JSON.stringify(store, null, 2)
    if (filename) {
      fs.writeFileSync(resolvePath(filename), settingsJson)
      view.succeed('Settings written to:' + filename)
    } else {
      view.succeed(
        'No file name provided, printing config to console:\n' + settingsJson
      )
    }
  } else {
    view.info('exiting')
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
