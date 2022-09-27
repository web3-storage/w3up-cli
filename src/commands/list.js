import ora, { oraPromise } from 'ora'

import client from '../client.js'
import { hasID } from '../validation.js'

/**
 *
 * @param {Array<any>} list
 * @returns {Array<any>}
 */
const listToTable = (list) =>
  list.map((li) => {
    const at = new Intl.DateTimeFormat('en-US').format(li.uploadedAt)
    let out = `${at.toLocaleString()}  ${li.rootContentCID}`

    const verbose = false
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
 * @returns {string}
 */
const formatOutput = (listResponse) => {
  const list = listResponse?.results || []
  const space = `\t\t\t\t\t\t\t`
  let headers = `Date       Root CID `
  let divider = `---------  -------  `

  const verbose = false
  if (verbose) {
    headers = `Date       Root CID ${space} CAR CID`
    divider = `---------  -------  ${space} -------`
  }

  const footer = `\nCount: ${listResponse?.count}`
  const output = [headers, divider, listToTable(list).join('\n'), footer]
  return `\n${output.join('\n')}`
}

const exe = async () => {
  const view = ora()
  /**
   * @type any
   */
  const listResponse = await oraPromise(client.list(), {
    text: `Listing Uploads...`,
    spinner: 'line',
  })

  if (!listResponse?.results?.length) {
    view.info(`You don't seem to have any uploads yet!`)
  } else {
    const formattedOutput = formatOutput(listResponse)
    view.succeed(formattedOutput)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 */
const build = (yargs) => yargs.check(() => hasID())

const list = {
  cmd: 'list',
  description: 'List your uploads',
  build,
  exe,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}

export default list
