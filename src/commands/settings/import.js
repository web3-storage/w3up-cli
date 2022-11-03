import { getClient, saveSettings } from '../../client.js'
import { isPath } from '../../validation.js'
import fs from 'fs'
import Inquirer from 'inquirer'
import ora from 'ora'

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
const handler = async ({ fileName, profile, yes = false }) => {
  const spinner = ora('export')
  const client = getClient(profile)
  let overwrite = yes

  if (!overwrite) {
    spinner.stopAndPersist({
      text: 'These values will overwrite your old id/account and you will lose access, are you sure you want to proceed?'
    })

    const input = await Inquirer.prompt({
      name: 'overwrite',
      type: 'confirm'
    })

    overwrite = input.overwrite
  }

  if (overwrite && fileName) {
    try {
      const json = fs.readFileSync(fileName, { encoding: 'utf-8' })
      client.settings = JSON.parse(json)
      await client.identity()
      saveSettings(client, profile)

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
    describe: 'Skip any prompts with "yes" as input.'
  })

/**
 *
 * @param {ImportSettingsArgs} argv
 * @returns
 */
const checkFileName = ({ fileName }) => isPath(fileName)

export default {
  command: 'import <fileName>',
  describe: 'Import a settings.json file',
  builder,
  handler,
  exampleOut: 'You have successfully imported settings.json!',
  exampleIn: '$0 import-settings settings.json'
}
