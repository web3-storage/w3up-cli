import client from '../client.js'
import ora from 'ora'
import fs from 'fs'
import { hasID } from '../validation.js'

const exe = async () => {
  const view = ora({ text: 'Checking identity', spinner: 'line' })
  try {
    const iam = await client.whoami()
    if (iam.error) {
      view.succeed(iam.message)
    } else {
      view.succeed(`${iam}`)
    }
  } catch (error) {
    view.fail('Could not check identity, check w3up-failure.log')
    await fs.promises.appendFile(
      'w3up-failure.log',
      'whoami: ' + JSON.stringify(error) + '\n'
    )
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
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
