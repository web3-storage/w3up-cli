import ora, { oraPromise } from 'ora'

import client from '../client.js'
import { hasID } from '../validation.js'

const exe = async () => {
  const view = ora()
  /**
   * @type any
   */
  const list = await oraPromise(client.list(), {
    text: `Listing Uploads...`,
    spinner: 'line',
  })

  if (!list.length) {
    view.info(`You don't seem to have any uploads yet!`)
  } else {
    view.succeed(`CIDs:\n${list.join('\n')}`)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 */
const builder = (yargs) => yargs.check(() => hasID())

export default {
  command: 'list',
  describe: 'List your uploads',
  builder,
  handler: exe,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}
