// @ts-ignore
import Table from 'cli-table'

import client, { settings } from '../client.js'

/**
 * @typedef {{}} ListAccounts
 * @typedef {import('yargs').Arguments<ListAccounts>} ListAccountsArgs
 */

/**
 * @async
 * @param {ListAccountsArgs} argv
 * @returns {Promise<void>}
 */
const exe = async ({} = {}) => {
  const id = await client.account()
  const selected = settings.get('delegation')
  const delegations = settings.get('delegations')

  const table = buildSimpleConsoleTable()
  for (const [did, del] of Object.entries(delegations)) {
    const cur = selected == did
    table.push([cur ? '*' : '', del.alias, did])
  }
  console.log(table.toString())
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const builder = (yargs) => yargs

export default {
  command: 'accounts',
  describe: 'List all accounts.',
  builder,
  handler: exe,
}

function buildSimpleConsoleTable() {
  return new Table({
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' ',
    },
    style: { 'padding-left': 0, 'padding-right': 0 },
  })
}
