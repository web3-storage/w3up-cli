import client from '../client.js'
import ora from 'ora'

const exe = async () => {
  const list = await client.list()
  console.log('List of uploaded/linked cars:\n' + list.join('\n'))
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
