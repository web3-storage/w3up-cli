// @ts-ignore
import { Delegation } from '@ucanto/server'
import inquirer from 'inquirer'

import client, { settings } from '../client.js'
import listAccounts from './listAccounts.js'

/**
 * @typedef {{did?:string, alias?:string}} SwitchAccounts
 * @typedef {import('yargs').Arguments<SwitchAccounts>} SwitchAccountsArgs
 */

/**
 * @async
 * @param {SwitchAccountsArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({ did, alias }) => {
  const id = await client.identity()
  const delegations = settings.get('delegations')
  if (!delegations) {
    console.log('No delegations.')
    return
  }
  let choices = []
  choices.push({
    name: 'agent\t\t' + id.did(),
    alias: 'mine',
    value: null,
  })

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
      const del = settings.set('delegation', found || null)
      console.log(`now using account: ${del?.issuer?.did() || id.did()}`)
    } else {
      console.log(
        `No account with alias ${alias} found. Here are your current accounts:\n`
      )
      listAccounts.handler()
    }
  } else if (did) {
  } else {
    await inquirerPick(id, choices)
  }
}

/**
 * @param {import('@ucanto/interface').SigningPrincipal<number>} id
 * @param {{ name: string; value: any; }[]} choices
 */
async function inquirerPick(id, choices) {
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
      settings.set('delegation', del || null)
      console.log(`now using account: ${del || id.did()}`)
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
