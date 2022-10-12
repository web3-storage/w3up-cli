import ora, { oraPromise } from 'ora'

import { getClient } from '../client.js'
import { buildSimpleConsoleTable } from '../utils.js'
import { hasID, hasSetupAccount } from '../validation.js'

/**
 * @typedef {{verbose?:boolean, profile: string}} List
 * @typedef {import('yargs').Arguments<List>} ListArgs
 */

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
 * @param {Array<any>} item
 * @param {boolean} verbose
 * @returns {Array<any>}
 */
function itemToTable(item, verbose = false) {
  let at = item.uploadedAt
  if (Date.parse(at)) {
    at = Date.parse(at)
  }

  at = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(at)
  //   let out = [at.toLocaleString(), item.dataCID] //, item.carCID]
  let out = [at.toLocaleString(), item.payloadCID]

  return out
}

/**
 *
 * @param {PagedListResponse} listResponse
 * @param {boolean} verbose
 * @returns {string}
 */
const formatOutput = (listResponse, verbose = false) => {
  const list = listResponse?.results || []

  const head = ['Date', 'car CID']
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
const exe = async (argv) => {
  const verbose = argv.verbose
  const client = getClient(argv.profile)
  const view = ora()
  /** @type any */
  const listResponse = await oraPromise(client.list(), {
    text: `Listing Uploads...`,
    spinner: 'line',
  })

  //   console.log('list', listResponse)
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
  handler: exe,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}
