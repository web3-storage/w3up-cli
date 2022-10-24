import ora, { oraPromise } from 'ora'

import { getClient } from '../../client.js'
import { buildSimpleConsoleTable, humanizeBytes } from '../../utils.js'
import { hasSetupAccount } from '../../validation.js'

/**
 * @typedef {{verbose?:boolean, delim?:string, stdout?:boolean, profile?: string}} List
 * @typedef {import('yargs').Arguments<List>} ListArgs
 */

/**
 * @typedef StoreItem
 * @property {string} payloadCID
 * @property {string} uploadedAt
 * @property {number} size
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

  let out = [uploadedAt, item.payloadCID]

  if (item.size) {
    const size = humanizeBytes(item.size)
    out.push(size)
  }
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

  const head = ['Date', 'Car CID', 'Size']
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
 * @param {ListArgs} argv
 * @returns {Promise<any>}
 */
const handler = async (argv) => {
  const verbose = argv.verbose
  const client = getClient(argv.profile)
  const view = ora()
  if (argv.stdout) {
    const delim = argv.delim || '\t'
    const listResponse = await client.stat()
    const output = listResponse?.results
      ?.map(
        (x) => `${new Date(x.uploadedAt).toISOString()}${delim}${x.payloadCID}`
      )
      .join('\n')
    process.stdout.write(`${output}\n`)
    return
  }

  /** @type any */
  const listResponse = await oraPromise(client.stat(), {
    text: `Listing linked cars...`,
    spinner: 'line',
  })

  if (!listResponse?.results?.length) {
    if (!listResponse.error) {
      view.info(`You don't seem to have linked cars!`)
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
    .check(hasSetupAccount)
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
  command: ['list', 'stat'],
  describe: 'List the linked cars in your account.',
  builder,
  handler,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}
