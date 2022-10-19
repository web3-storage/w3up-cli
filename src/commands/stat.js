import ora, { oraPromise } from 'ora'

import { getClient } from '../client.js'
import { buildSimpleConsoleTable } from '../utils.js'
import { hasSetupAccount } from '../validation.js'

/**
 * @typedef {{verbose?:boolean, profile?: string}} Stat
 * @typedef {import('yargs').Arguments<Stat>} StatArgs
 */

/**
 * @typedef StoreItem
 * @property {string} carCID
 * @property {string} uploadedAt
 */

/**
 * @template T
 * @typedef ListResult<T>
 * @property {number} count
 * @property {number} pages
 * @property {number} page
 * @property {number} pageSize
 * @property {Array<T>} results
 */

/**
 * @param {StoreItem} item
 * @param {boolean} verbose
 * @returns {Array<string>}
 */
function itemToTable(item, verbose = false) {
  let at = item.uploadedAt
  let uploadedAt = ''
  if (Date.parse(at)) {
    uploadedAt = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
      .format(Date.parse(at))
      .toLocaleString()
  }

  let out = [uploadedAt, item.carCID]
  if (verbose) {
    // show application did?
  }
  return out
}

/**
 *
 * @param {ListResult<StoreItem>} listResponse
 * @param {boolean} verbose
 * @returns {string}
 */
const formatOutput = (listResponse, verbose = false) => {
  const list = listResponse?.results || []

  const head = ['Date', 'Car CID']
  if (verbose) {
    head.push('Application DID')
  }
  const table = buildSimpleConsoleTable(head)
  for (const upload of list) {
    table.push(itemToTable(upload, verbose))
  }
  return table.toString()
}

/**
 * @async
 * @param {StatArgs} argv
 * @returns {Promise<any>}
 */
const handler = async (argv) => {
  const verbose = argv.verbose
  const client = getClient(argv.profile)
  const view = ora()
  /** @type any */
  const listResponse = await oraPromise(client.list(), {
    text: `Listing linked cars...`,
    spinner: 'line',
  })

  if (!listResponse?.results?.length) {
    view.info(`You don't seem to have linked cars!`)
  } else {
    console.log(formatOutput(listResponse, verbose))
  }
}

/** @type {import('yargs').CommandBuilder} yargs */
const builder = (yargs) => yargs.check(hasSetupAccount)
//     .option('verbose', {
//     type: 'boolean',
//     alias: 'verbose',
//     showInHelp: true,
//     describe: 'Show more columns in the list',
//   })

export default {
  command: 'stat',
  describe: 'stat (list) the linked cars in your account',
  builder,
  handler,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}
