import client from '../client.js'
import ora from 'ora'
import { isCID } from '../validation.js'

const exe = async (argv) => {
  console.log(argv)

  const { cid, ws, subscribe } = argv

  const shouldWS = ws || subscribe

  const view = ora(`Getting Insight for ${cid}...`).start()
  const res = await client.insights(cid)
  view.succeed(res)

  if (shouldWS) {
    console.log(`⚠️Subscriptions not yet supported ⚠️`)

    const wsView = ora(`Getting Insight Subscription for ${cid}...`).start()
    if (client.insightsWS) {
      const response = await client.insightsWS(cid)
      console.log('response', response)
    }

    wsView.succeed(`${cid}`)
  }
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
    type: 'boolean',
    alias: 'ws',
    showInHelp: true,
    describe: 'Get a Subscription to incoming insights',
  })

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
