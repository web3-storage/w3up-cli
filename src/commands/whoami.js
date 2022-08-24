import client from '../client.js'
import ora from 'ora'
import { hasID } from '../validation.js'

import { logToFile } from '../lib/logging.js'

const exe = async () => {
  const view = ora({ text: 'Checking identity', spinner: 'line' })
  try {
    const reponse = await client.whoami()
    if (reponse.error) {
      view.succeed(reponse.message)
    } else {
      view.succeed(`${reponse}`)
    }
  } catch (error) {
    view.fail('Could not check identity, check w3up-failure.log')
    logToFile('whoami', error)
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) => yargs.check(() => hasID())

const whoami = {
  cmd: 'whoami',
  description: 'Show your current UCAN Identity',
  build,
  exe,
  exampleOut: `DID:12345...`,
  exampleIn: '$0 whoami',
}

export default whoami
