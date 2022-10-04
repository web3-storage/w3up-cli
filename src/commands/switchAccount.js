// @ts-ignore
import { Delegation } from '@ucanto/server'
import inquirer from 'inquirer'

import { getClient } from '../client.js'
import listAccounts from './listAccounts.js'

/**
 * @typedef {{did?:string, alias?:string, profile: string}} SwitchAccounts
 * @typedef {import('yargs').Arguments<SwitchAccounts>} SwitchAccountsArgs
 */

/**
 * @async
 * @param {SwitchAccountsArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ did, alias, profile }) => {
  const client = getClient(profile)
  const delegations = client.settings.get('delegations')
  if (!delegations) {
    console.log('No delegations.')
    return
  }
  let choices = []

  for (const del of Object.values(delegations)) {
    const imported = Delegation.import([del.ucan.root])
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
      client.settings.set('delegation', del)
      console.log(`now using account: ${del}`)
    } else {
      console.log(
        `No account with alias ${alias} found. Here are your current accounts:\n`
      )
      listAccounts.handler({ profile })
    }
  } else if (did) {
  } else {
    await inquirerPick(choices, client)
  }
}

/**
 * @param {{ name: string; value: any; }[]} choices
 * @param {any} client
 */
async function inquirerPick(choices, client) {
  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'Choose an account',
        choices,
        default: client.settings.get('delegation'),
      },
    ])
    .then((answers) => {
      const del = answers['Choose an account']
      client.settings.set('delegation', del)
      console.log(`now using account: ${del}`)
    })
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) =>
  yargs.option('did', {
    type: 'string',
    showInHelp: true,
    describe: 'select account by did',
  })

export default {
  command: 'switch-account [alias]',
  describe: 'Select from accounts, including imported ones.',
  builder,
  handler: exe,
}
