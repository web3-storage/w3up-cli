// @ts-ignore
import { getClient, saveSettings } from '../../client.js'
import { hasID } from '../../validation.js'
import listAccounts from './list.js'
import { stringToDelegation } from '@web3-storage/w3up-client'
import inquirer from 'inquirer'

/**
 * @typedef {{did?:string, alias?:string, profile?: string}} SwitchAccounts
 * @typedef {import('yargs').Arguments<SwitchAccounts>} SwitchAccountsArgs
 */

/**
 * @async
 * @param {SwitchAccountsArgs} argv
 * @returns {Promise<void>}
 */
const handler = async ({ did, alias, profile = 'main' }) => {
  const client = getClient(profile)
  const settings = client.settings
  const delegations = settings.delegations
  if (!delegations) {
    console.log('No delegations.')
    return
  }
  let choices = []

  for (const del of Object.values(delegations)) {
    const imported = await stringToDelegation(del.ucan)
    choices.push({
      name: del.alias + '\t' + imported.issuer.did(),
      alias: del.alias,
      value: imported.issuer.did(),
    })
  }

  if (alias) {
    const found = choices.find((x) => x.alias == alias)
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
  } else {
    await inquirerPick(choices, client, profile)
  }
}

/**
 * @param {{ name: string; value: any; }[]} choices
 * @param {any} client
 * @param {string} profile
 */
async function inquirerPick(choices, client, profile) {
  const settings = await client.settings
  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'Choose an account',
        choices,
        default: settings.account,
      },
    ])
    .then((answers) => {
      const del = answers['Choose an account']
      settings.account = del
      saveSettings(client, profile)
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
    describe: 'select account by did',
  })

export default {
  command: 'switch [alias]',
  describe: 'Select from delegations, including imported ones.',
  builder,
  handler,
}
