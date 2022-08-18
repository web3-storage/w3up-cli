import client from '../client.js'
import ora from 'ora'
import { isCID } from '../validation.js'

const exe = async (argv) => {
  const { cid } = argv
  const view = ora(`Getting Insight for ${cid}...`).start()
  const res = await client.insights(cid)
  view.succeed(res)
}

const build = (yargs) => {
  yargs.check((argv) => {
    const { cid } = argv
    try {
      isCID(cid)
      return true
    } catch (err) {
      throw new Error(`${cid} is probably not a valid CID: \n${err}`)
    }
  })

  yargs.option('subscribe', {
    alias: 'ws',
    describe: 'Get a Subscription to incoming insights',
  })

  console.log(yargs)

  yargs.help()

  return yargs
}

const insights = {
  cmd: 'insights <cid>',
  description: 'Get insights for a CID',
  build,
  exe,
  exampleOut: `example output goes here`,
  exampleIn: '$0 insights',
}

export default insights
