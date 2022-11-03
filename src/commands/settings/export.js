import { getClient } from '../../client.js'
import { resolvePath } from '../../validation.js'
import fs from 'fs'
import Inquirer from 'inquirer'
import ora from 'ora'

/**
 * @typedef ExportSettings
 * @property {string} [filename]
 * @property {string} [profile]
 * @property {boolean} [stdout]
 * @property {boolean} [yes]
 */

/**
 * @typedef {import('yargs').Arguments<ExportSettings>} ExportSettingsArgs
 */

/**
 * Export settings by printing to console or writing to a json file.
 * @async
 * @param {ExportSettingsArgs} args
 * @returns {Promise<void>}
 */
const handler = async ({ filename, profile, stdout = false, yes = false }) => {
  const client = getClient(profile)

  if (stdout) {
    const store = client.settings
    process.stdout.write(JSON.stringify(store))
    return
  }

  const view = ora().start()
  let show = yes

  if (!show) {
    view.stopAndPersist({
      text: 'These values give anyone the power to act as you, are you sure you want to export them?',
    })
    const input = await Inquirer.prompt({
      name: 'show',
      type: 'confirm',
    })
    show = input.show
  }

  if (show) {
    const store = client.settings
    const settingsJson = JSON.stringify(store, null, 2)

    if (filename) {
      fs.writeFileSync(resolvePath(filename), settingsJson)
      view.succeed(`Settings written to: ${filename}`)
    } else {
      view.succeed(
        `No file name provided, printing config to console:\n${settingsJson}`
      )
    }
  } else {
    view.info('exiting')
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 */
const builder = (yargs) =>
  yargs
    .option('stdout', {
      type: 'boolean',
      showInHelp: true,
      describe: 'Output a machine readable format to stdout',
    })
    .option('yes', {
      type: 'boolean',
      alias: 'y',
      showInHelp: true,
      describe: 'Skip any prompts with "yes" as input.',
    })

export default {
  command: 'export [filename]', //[] means optional arg.
  describe: 'Export a settings json file',
  builder,
  handler,
  exampleOut: `DID:12345`,
  exampleIn: '$0 export-settings',
}
