import client from '../client.js'
import ora, { oraPromise } from 'ora'
import { isCID } from '../validation.js'

const exe = async ({ cid, ws, subscribe }) => {
  const spinner = ora({ text: `Getting insights for ${cid}`, spinner: 'line' })
  const shouldWS = ws || subscribe

  if (shouldWS) {
    spinner.fail(`⚠️Subscriptions not yet supported ⚠️`)

    //     const wsView = ora(`Getting Insight Subscription for ${cid}...`).start()
    //     if (client.insightsWS) {
    //       const response = await client.insightsWS(cid)
    //       console.log('response', response)
    //     }
    //
    //     wsView.succeed(`${cid}`)
  } else {
    const insights = await client.insights(cid)
    spinner.succeed(JSON.stringify(insights?.insight_data, null, 2))
  }
}

const build = (yargs) => {
  return yargs
    .check(({ cid }) => {
      try {
        return isCID(cid)
      } catch (err) {
        throw new Error(`${cid} is probably not a valid CID: \n${err}`)
      }
    })
    .option('subscribe', {
      type: 'boolean',
      alias: 'ws',
      showInHelp: true,
      describe: 'Get a Subscription to incoming insights',
    })
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
