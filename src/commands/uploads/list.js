import ora, { oraPromise } from 'ora'

import { getClient } from '../../client.js'
import { buildSimpleConsoleTable } from '../../utils.js'
import { hasSetupAccount } from '../../validation.js'

/**
 * @typedef {{verbose?:boolean, delim?:string, stdout?:boolean, profile?: string}} List
 * @typedef {import('yargs').Arguments<List>} ListArgs
 */

/**
 * @typedef UploadItem
 * @property {string} dataCID
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
 * @param {number} date
 * @returns {string}
 */
function parseDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
    .format(date)
    .toLocaleString()
}

/**
 * @param {UploadItem} item
 * @param {boolean} verbose
 * @returns {Array<any>}
 */
function itemToTable(item, verbose = false) {
  const uploadedAt = parseDate(item.uploadedAt)
  let out = [uploadedAt, item.dataCID]
  if (verbose) {
    out.push(item.carCID)
  }
  return out
}

/**
 *
 * @param {ListResult<UploadItem>} listResponse
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

  if (argv.stdout) {
    const delim = argv.delim || '\t'
    const listResponse = await client.list()
    // @ts-expect-error
    const output = listResponse?.results
      ?.map(
        // @ts-expect-error
        (x) =>
          `${new Date(x.uploadedAt).toISOString()}${delim}${x.dataCID}${delim}${
            x.carCID
          }`
      )
      .join('\n')
    process.stdout.write(`${output}\n`)
    return
  }

  /** @type any */
  const listResponse = await oraPromise(client.list(), {
    text: `Listing Uploads...`,
    spinner: 'line',
  })

  if (!listResponse?.results?.length) {
    if (!listResponse.error) {
      view.info(`You don't seem to have any uploads yet!`)
    } else {
      view.fail(listResponse.cause.message)
    }
  } else {
    console.log(formatOutput(listResponse, verbose))
  }
}

/** @type {import('yargs').CommandBuilder} yargs */
const builder = (yargs) =>
  yargs
    // .check(hasSetupAccount)
    .option('verbose', {
      type: 'boolean',
      alias: 'verbose',
      showInHelp: true,
      describe: 'Show more columns in the list, such as the Uploaded CAR CID',
    })
    .option('stdout', {
      type: 'boolean',
      showInHelp: true,
      describe: 'Output a machine readable format to stdout',
    })
    .option('delim', {
      type: 'string',
      showInHelp: true,
      implies: 'stdout',
      describe: 'The delimiter to use when using stdout',
    })

export default {
  command: ['list', 'uploads list'],
  describe: 'List your uploads',
  builder,
  handler,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}
