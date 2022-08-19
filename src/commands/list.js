import client from '../client.js'
import ora from 'ora'

const exe = async () => {
  const view = ora(`Listing Uploads...`).start()
  const list = await client.list()

  view.succeed(`CIDs:\n${list.join('\n')}`)
  if (!list.lengh) {
    console.log(`\tYou don't seem to have any uploads yet!`)
  }
}

const list = {
  cmd: 'list',
  description: 'List your uploads',
  build: {},
  exe,
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}

export default list
