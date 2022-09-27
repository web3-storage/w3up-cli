import { Delegation, UCAN } from '@ucanto/core'
import fs from 'fs'
import Inquirer from 'inquirer'
import ora from 'ora'

import { settings } from '../client.js'
import { resolvePath } from '../validation.js'

/**
 * @typedef {{filename?:string}} ExportSettings
 * @typedef {import('yargs').Arguments<ExportSettings>} ExportSettingsArgs
 */

/**
 * Export settings by printing to console or writing to a json file.
 * @async
 * @param {ExportSettingsArgs} args
 * @returns {Promise<void>}
 */
const exe = async ({ filename }) => {
  const view = ora().start()

  view.stopAndPersist({
    text: 'These values give anyone the power to act as you, are you sure you want to export them?',
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
    if (store.agent_secret) {
      store.agent_secret = Buffer.from(store.agent_secret).toString('base64')
    }
    if (store.account_secret) {
      store.account_secret = Buffer.from(store.account_secret).toString(
        'base64'
      )
    }

    for (const [did, del] of Object.entries(store.delegations)) {
      //       console.log('what', del)
      const imported = Delegation.import([del?.ucan?.root])
      store.delegations[did] = { ucan: UCAN.format(imported), alias: del.alias }
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
  command: 'export-settings [filename]', //[] means optional arg.
  describe: 'Export a settings json file',
  builder: {},
  handler: exe,
  exampleOut: `DID:12345`,
  exampleIn: '$0 export-settings',
}

export default exportSettings
