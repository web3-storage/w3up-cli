import ora, { oraPromise } from 'ora'

import { getClient } from '../client.js'
import { buildSimpleConsoleTable } from '../utils.js'
import { hasID, hasSetupAccount } from '../validation.js'

/**
 * @typedef {{verbose?:boolean, profile: string}} List
 * @typedef {import('yargs').Arguments<List>} ListArgs
 */

/**
 * @typedef UploadItem
 * @property {string} rootContentCID
 * @property {string} carCID
 * @property {number} uploadedAt
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
 * @param {UploadItem} item
 * @param {boolean} verbose
 * @returns {Array<any>}
 */
function itemToTable(item, verbose = false) {
  const at = new Intl.DateTimeFormat('en-US').format(item.uploadedAt)
  let out = [at.toLocaleString(), item.rootContentCID]
  if (verbose) {
    out.push(item.carCID)
  }

  return out
}

/**
 * @typedef {{
 *  results: Array<any>
 *  count: number
 *  page: number
 *  nextPage: number|null
 *  previousPage: number|null
 *  pageSize: number
 * }} PagedListResponse
 */

/**
 *
 * @param {PagedListResponse} listResponse
 * @param {boolean} verbose
 * @returns {string}
 */
const formatOutput = (listResponse, verbose = false) => {
  const list = listResponse?.results || []

  const head = ['Date', 'Data CID']
  if (verbose) {
    head.push('Car CID')
  }
  const table = buildSimpleConsoleTable(head)
  for (const upload of list) {
    table.push(itemToTable(upload, verbose))
  }
  return table.toString()
}

/**
 * @async
 * @param {ListArgs} argv
 * @returns {Promise<any>}
 */
const handler = async (argv) => {
  const verbose = argv.verbose
  const client = getClient(argv.profile)
  const view = ora()
  /** @type any */
  const listResponse = await oraPromise(client.list(), {
    text: `Listing Uploads...`,
    spinner: 'line',
  })

  // You can delete this later (9/27/2022)
  // its extremely short-term to prevent collisions with old api
  if (Array.isArray(listResponse)) {
    if (!listResponse.length) {
      view.info(`You don't seem to have any uploads yet!`)
    } else {
      console.log(listResponse.join('\n'))
    }
    return
  }

  if (!listResponse?.results?.length) {
    view.info(`You don't seem to have any uploads yet!`)
  } else {
    console.log(formatOutput(listResponse, verbose))
  }
}

/** @type {import('yargs').CommandBuilder} yargs */
const builder = (yargs) =>
  yargs.check(hasSetupAccount).option('verbose', {
    type: 'boolean',
    alias: 'verbose',
    showInHelp: true,
    describe: 'Show more columns in the list, such as the Uploaded CAR CID',
  })

export default {
  command: 'list',
  describe: 'List your uploads',
  builder,
  handler,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}
