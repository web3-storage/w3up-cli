import client from '../client.js'
import ora from 'ora'

const exe = async () => {
  const view = ora(`whoami?`).start()
  const iam = await client.whoami()
  view.succeed(`${iam}`)
}

const whoami = {
  cmd: 'whoami',
  description: 'Show your current UCAN Identity',
  build: {},
  exe,
  exampleOut: `DID:12345...`,
  exampleIn: '$0 whoami',
}

export default whoami
