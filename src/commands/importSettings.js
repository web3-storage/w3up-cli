import { Delegation, UCAN } from '@ucanto/core'
import fs from 'fs'
import Inquirer from 'inquirer'
import ora from 'ora'

import client, { settings } from '../client.js'
import { isPath } from '../validation.js'

/**
 * @typedef {{fileName?:string}} ImportSettings
 * @typedef {import('yargs').Arguments<ImportSettings>} ImportSettingsArgs
 */

/**
 * @async
 * @param {ImportSettingsArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ fileName }) => {
  const spinner = ora('export')
  spinner.stopAndPersist({
    text: 'These values will overwrite your old id/account and you will lose access, are you sure you want to proceed?',
  })

  const { show } = await Inquirer.prompt({
    name: 'show',
    type: 'confirm',
  })

  if (show && fileName) {
    try {
      settings.clear()
      const json = fs.readFileSync(fileName, { encoding: 'utf-8' })
      const imported = JSON.parse(json)

      function importBuffer(key) {
        const parsed = Buffer.from(imported[key], 'base64')
        if (parsed) {
          settings.set(key, parsed)
        }
      }

      if (settings && imported) {
        for (var key of Object.keys(imported)) {
          if (
            key == 'secret' ||
            key == 'agent_secret' ||
            key == 'account_secret'
          ) {
            importBuffer(key)
          } else if (key == 'delegations') {
            const delegations = {}

            for (const [did, del] of Object.entries(imported.delegations)) {
              const ucan = UCAN.parse(del?.ucan)
              const root = await UCAN.write(ucan)
              delegations[did] = {
                ucan: Delegation.create({ root }),
                alias: del.alias,
              }
            }

            settings.set('delegations', delegations)
          } else {
            settings.set(key, imported[key])
          }
        }
      }

      if (!settings.has('account_secret') || !settings.has('agent_secret')) {
        await client.identity()
      }

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
const builder = (yargs) => yargs.check(checkFileName)

/**
 *
 * @param {ImportSettingsArgs} argv
 * @returns
 */
const checkFileName = ({ fileName }) => isPath(fileName)

const importSettings = {
  command: 'import-settings <fileName>',
  describe: 'Import a settings.json file',
  builder,
  handler: exe,
  exampleOut: `You have successfully imported settings.json!`,
  exampleIn: '$0 import-settings settings.json',
}

export default importSettings
