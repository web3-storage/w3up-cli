// @ts-ignore
import { importSettings } from '@web3-storage/w3up-client'
import fs from 'fs'
import Inquirer from 'inquirer'
import ora from 'ora'

import { getClient } from '../client.js'
import { isPath } from '../validation.js'

/**
 * @typedef ImportSettings
 * @property {string} [fileName]
 * @property {string} [profile]
 * @property {boolean} [yes]
 */

/**
 * @typedef {import('yargs').Arguments<ImportSettings>} ImportSettingsArgs
 */

/**
 * @async
 * @param {ImportSettingsArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ fileName, profile, yes = false }) => {
  const spinner = ora('export')
  const client = getClient(profile)
  let show = yes

  if (!show) {
    spinner.stopAndPersist({
      text: 'These values will overwrite your old id/account and you will lose access, are you sure you want to proceed?',
    })

    const input = await Inquirer.prompt({
      name: 'show',
      type: 'confirm',
    })

    show = input.show
  }

  if (show && fileName) {
    try {
      client.settings.clear()
      const json = fs.readFileSync(fileName, { encoding: 'utf-8' })
      const imported = await importSettings(json)

      for (const [key, value] of imported.entries()) {
        client.settings.set(key, value)
      }

      await client.identity()

      spinner.succeed(`Imported settings from ${fileName} successfully.`)
    } catch (err) {
      spinner.fail('error:' + err)
    }
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) =>
  yargs.check(checkFileName).option('yes', {
    type: 'boolean',
    alias: 'y',
    showInHelp: true,
    describe: 'Skip any prompts with "yes" as input.',
  })

/**
 *
 * @param {ImportSettingsArgs} argv
 * @returns
 */
const checkFileName = ({ fileName }) => isPath(fileName)

export default {
  command: 'import-settings <fileName>',
  describe: 'Import a settings.json file',
  builder,
  handler: exe,
  exampleOut: `You have successfully imported settings.json!`,
  exampleIn: '$0 import-settings settings.json',
}
