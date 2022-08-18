import ora from 'ora'
import Inquirer from 'inquirer'
import fs from 'fs'

import { settings } from '../client'

/**
 * @async
 * @param {object} argv
 * @param {string} argv.fileName - The name of the file to import
 * @returns {Promise<void>}
 */
const exe = async ({ fileName }) => {
  //TODO put in build step.
  if (!fs.existsSync(fileName)) {
    console.log(`${fileName} does not exist.`)
    return
  }
  const view = ora('export')
  view.stopAndPersist({
    text: 'These values will overwrite your old id/account and you will lose access, are you sure you want to proceed?',
  })

  const { show } = await Inquirer.prompt({
    name: 'show',
    type: 'confirm',
  })

  if (show && fileName) {
    try {
      const str = fs.readFileSync(fileName, { encoding: 'utf-8' })
      const obj = JSON.parse(str)
      console.log(obj)

      if (obj) {
        for (var key of Object.keys(obj)) {
          if (key == 'secret') {
            const secret = Uint8Array.from(Buffer.from(obj.secret, 'base64'))
            settings.set(key, secret)
          } else {
            settings.set(key, obj[key])
          }
        }
      }
    } catch (err) {
      console.log('err', err)
    }
  }
}

const importSettings = {
  cmd: 'import-settings <filename>',
  description: 'Import a settings.json file',
  build: {},
  exe,
  exampleOut: `You have successffully imported settings.json!`,
  exampleIn: '$0 import-settings settings.json',
}

export default importSettings
