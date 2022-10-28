// @ts-ignore
import { Delegation } from '@ucanto/server'
import inquirer from 'inquirer'
import { stringToDelegation } from '../../encoding.js'

import { getClient } from '../../client.js'
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
  const settings = await client.settings
  const delegations = settings.get('delegations')
  if (!delegations) {
    console.log('No delegations.')
    return
  }
  let choices = []

  for (const del of Object.values(delegations)) {
    const imported = await stringToDelegation(del.ucan) // Delegation.import([del.ucan.root])
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
      settings.set('delegation', del)
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
    await inquirerPick(choices, client)
  }
}

/**
 * @param {{ name: string; value: any; }[]} choices
 * @param {any} client
 */
async function inquirerPick(choices, client) {
  const settings = await client.settings
  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'Choose an account',
        choices,
        default: settings.get('delegation'),
      },
    ])
    .then((answers) => {
      const del = answers['Choose an account']
      settings.set('delegation', del)
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
