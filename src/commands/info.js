import ora, { oraPromise } from 'ora'
import { default as info } from '../settings.js'
import { settings } from '../client.js'

/**
 * @async
 * @returns {Promise<void>}
 */
const exe = async () => {
  console.log('showing information about setup')
  console.log(info)
}

export default {
  cmd: 'info',
  description: 'Print information about cli',
  build: {},
  exe,
  exampleOut: ``,
  exampleIn: '$0 info',
}
