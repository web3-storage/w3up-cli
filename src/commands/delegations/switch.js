// @ts-ignore
import inquirer from 'inquirer'
import { stringToDelegation } from '../../encoding.js'

import { getClient, saveSettings } from '../../client.js'
import { hasID } from '../../validation.js'
import listAccounts from './list.js'

/**
 * @typedef {{did?:string, alias?:string, profile?: string}} SwitchAccounts
 * @typedef {import('yargs').Arguments<SwitchAccounts>} SwitchAccountsArgs
 */

/**
 * @async
 * @param {SwitchAccountsArgs} argv
 * @returns {Promise<void>}
 */
const handler = async ({ did, alias, profile }) => {
  const client = getClient(profile)
  const settings = client.settings
  const delegations = settings.delegations
  if (!delegations) {
    console.log('No delegations.')
    return
  }
  const choices = []

  for (const del of Object.values(delegations)) {
    const imported = await stringToDelegation(del.ucan)
    choices.push({
      name: del.alias + '\t' + imported.issuer.did(),
      alias: del.alias,
      value: imported.issuer.did()
    })
  }

  if (alias) {
    const found = choices.find((x) => x.alias === alias)
    if (found) {
      const del = found.value
      settings.account = del
      saveSettings(client, profile)
      console.log(`now using account: ${del}`)
    } else {
      console.log(
        `No account with alias ${alias} found. Here are your current accounts:\n`
      )

      // @ts-expect-error
      listAccounts.handler({ profile })
    }
  } else if (did) {
    // empty placeholder for future functionality
  } else {
    await inquirerPick(choices, client)
  }
}

/**
 * @param {{ name: string; value: any; }[]} choices
 * @param {any} client
 */
async function inquirerPick (choices, client) {
  const settings = await client.settings
  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'Choose an account',
        choices,
        default: settings.get('account')
      }
    ])
    .then((answers) => {
      const del = answers['Choose an account']
      settings.set('account', del)
      console.log(`now using account: ${del}`)
    })
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) =>
  yargs.check(hasID).option('did', {
    type: 'string',
    showInHelp: true,
    describe: 'select account by did'
  })

export default {
  command: 'switch [alias]',
  describe: 'Select from delegations, including imported ones.',
  builder,
  handler
}
