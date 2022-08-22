import ora from 'ora'
import Inquirer from 'inquirer'
import fs from 'fs'
import { settings } from '../client.js'
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
      const json = fs.readFileSync(fileName, { encoding: 'utf-8' })
      const imported = JSON.parse(json)
      if (settings && imported) {
        for (var key of Object.keys(imported)) {
          if (key == 'secret') {
            const secret = Uint8Array.from(
              Buffer.from(imported.secret, 'base64')
            )
            settings.set(key, secret)
          } else {
            settings.set(key, imported[key])
          }
        }
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
const build = (yargs) => yargs.check(checkFileName)

/**
 *
 * @param {ImportSettingsArgs} argv
 * @returns
 */
const checkFileName = ({ fileName }) => isPath(fileName)

const importSettings = {
  cmd: 'import-settings <fileName>',
  description: 'Import a settings.json file',
  build,
  exe,
  exampleOut: `You have successfully imported settings.json!`,
  exampleIn: '$0 import-settings settings.json',
}

export default importSettings
