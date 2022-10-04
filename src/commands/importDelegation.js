import fs from 'fs'
import ora from 'ora'

import { getClient } from '../client.js'
import { hasID, isPath } from '../validation.js'

/**
 * @typedef {{fileName?:string, alias?:string, profile: string}} ImportDelegation
 * @typedef {import('yargs').Arguments<ImportDelegation>} ImportDelegationArgs
 */

/**
 * @async
 * @param {ImportDelegationArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ fileName, alias = '', profile }) => {
  const view = ora('export')
  const client = getClient(profile)
  if (fileName) {
    try {
      const bytes = await fs.promises.readFile(fileName)
      const imported = await client.importDelegation(bytes, alias)
      const did = imported?.issuer?.did()

      view.succeed(
        `Imported delegation for ${alias} ${did} from ${fileName} successfully.`
      )
    } catch (err) {
      view.fail('error:' + err)
    }
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) => yargs.check(hasID).check(checkFileName)

/**
 *
 * @param {ImportDelegationArgs} argv
 * @returns
 */
const checkFileName = ({ fileName }) => isPath(fileName)

export default {
  command: 'import-delegation <fileName> [alias]',
  describe:
    'Import a delegation.car file for access to an account (and give it an optional alias).',
  builder,
  handler: exe,
}
