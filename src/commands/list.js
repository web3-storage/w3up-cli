import ora, { oraPromise } from 'ora'

import client from '../client.js'
import { hasID } from '../validation.js'

/**
 * @typedef {{verbose?:boolean}} List
 * @typedef {import('yargs').Arguments<List>} ListArgs
 */

/**
 *
 * @param {Array<any>} list
 * @param {boolean} verbose
 * @returns {Array<any>}
 */
const listToTable = (list, verbose = false) =>
  list.map((li) => {
    const at = new Intl.DateTimeFormat('en-US').format(li.uploadedAt)
    let out = `${at.toLocaleString()}  ${li.rootContentCID}`

    if (verbose) {
      out = `${at.toLocaleString()}  ${li.rootContentCID} \t ${li.carCID}`
    }

    return out
  })

/**
 * @typedef {{
 *  results: Array<any>
 *  count: number
 *  page: number
 *  nextPage: number|null
 *  previousPage: number|null
 *  pageSize: number
 * }} PagedListResponse
 *
 */

/**
 *
 * @param {PagedListResponse} listResponse
 *  @param {boolean} verbose
 * @returns {string}
 */
const formatOutput = (listResponse, verbose = false) => {
  const list = listResponse?.results || []
  const space = `\t\t\t\t\t\t\t`
  let headers = `Date       Root CID `
  let divider = `---------  -------  `

  if (verbose) {
    headers = `Date       Root CID ${space} CAR CID`
    divider = `---------  -------  ${space} -------`
  }

  const footer = `\nCount: ${listResponse?.count}`
  const output = [
    headers,
    divider,
    listToTable(list, verbose).join('\n'),
    footer,
  ]
  return `\n${output.join('\n')}`
}

/**
 * @async
 * @param {ListArgs} argv
 * @returns {Promise<any>}
 */
const exe = async (argv) => {
  const verbose = argv.verbose

  const view = ora()
  /**
   * @type any
   */
  const listResponse = await oraPromise(client.list(), {
    text: `Listing Uploads...`,
    spinner: 'line',
  })

  //You can delete this later (9/27/2022)
  //its extremely short-term to prevent collisions with old api
  if (Array.isArray(listResponse)) {
    return view.succeed(`\n${listResponse.join('\n')}`)
  }

  if (!listResponse?.results?.length) {
    view.info(`You don't seem to have any uploads yet!`)
  } else {
    const formattedOutput = formatOutput(listResponse, verbose)
    return view.succeed(formattedOutput)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 */
const builder = (yargs) =>
  yargs
    .check(() => hasID())
    .option('verbose', {
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
