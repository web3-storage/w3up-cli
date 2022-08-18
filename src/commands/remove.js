import client from '../client.js'
import ora from 'ora'
import { isCID } from '../validation'

const exe = async () => {
  const view = ora(`Listing Uploads...`).start()
  const list = await client.list()

  view.succeed(`CIDs:\n${list.join('\n')}`)
  if (!list.lengh) {
    console.log(`\tYou don't seem to have any uploads yet!`)
  }
}

//TODO allow list of CIDs
// https://github.com/nftstorage/w3up-cli/issues/20
const remove = {
  cmd: 'remove <cid>',
  description: 'Unlink a CID from your account.',
  build: (yargs) => {
    yargs.check((argv) => {
      const { cid } = argv
      //pretty loose, really just checking typos.
      if (isCID(cid)) {
        return true
      }
      throw new Error(`Error: ${cid} is probably not a valid CID.`)
    })
    return yargs
  },
  exe,
  exampleIn: '$0 remove',
  exampleOut: `unlinked bafy...`,
}

export default remove
