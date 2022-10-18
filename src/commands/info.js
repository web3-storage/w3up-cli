import { default as info } from '../settings.js'

/**
 * @async
 * @returns {Promise<void>}
 */
const handler = async () => {
  console.log('showing information about setup')
  console.log(info)
}

export default {
  command: 'info',
  describe: 'Print information about cli',
  builder: {},
  handler,
  exampleOut: ``,
  exampleIn: '$0 info',
}
