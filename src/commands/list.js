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
    return `${at.toLocaleString()}  ${li.rootCarCID} \t ${li.transportCarCID}`
  })

/**
 *
 * @param {*} list
 * @returns {string}
 */
const formatOutput = (list) => {
  const space = `\t\t\t\t\t\t\t`
  const headers = `Date       RootCid ${space} Transport CID`
  const divider = `---------  ------- ${space} -------------`
  return `\n${headers}\n${divider}\n${listToTable(list).join('\n')}`
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

  if (!listResponse.length) {
    view.info(`You don't seem to have any uploads yet!`)
  } else {
    const formattedOutput = formatOutput(listResponse)
    view.succeed()
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
