import ora, { oraPromise } from 'ora'

import client from '../client.js'
import { hasID } from '../validation.js'

const exe = async () => {
  const view = ora()
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
