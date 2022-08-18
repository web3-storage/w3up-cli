import client from '../client.js'
import ora from 'ora'
import { isCID } from '../validation.js'
import { parseLink } from '@ucanto/server'

const exe = async (argv) => {
  const { cid } = argv
  const view = ora(`Unlinking ${cid}...`).start()
  const res = await client.remove(parseLink(cid))

  view.succeed(`${res.toString()}`)
}

//TODO allow list of CIDs
// https://github.com/nftstorage/w3up-cli/issues/20
const remove = {
  cmd: 'remove <cid>',
  description: 'Unlink a CID from your account.',
  build: (yargs) => {
    yargs.check((argv) => {
      const { cid } = argv
      try {
        isCID(cid)
        return true
      } catch (err) {
        throw new Error(`${cid} is probably not a valid CID: \n${err}`)
      }
    })
    return yargs
  },
  exe,
  exampleIn: '$0 remove bafy...',
  exampleOut: `unlinked bafy...`,
}

export default remove
