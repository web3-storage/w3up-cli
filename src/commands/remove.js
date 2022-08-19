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

const build = (yargs) => {
  yargs.check(({ cid }) => {
    try {
      return isCID(cid)
    } catch (err) {
      throw new Error(`${cid} is probably not a valid CID: \n${err}`)
    }
  })
  return yargs
}

//TODO allow list of CIDs
// https://github.com/nftstorage/w3up-cli/issues/20
const remove = {
  cmd: ['remove <cid>', 'unlink <cid>'],
  description: 'Unlink a CID from your account.',
  build,
  exe,
  exampleIn: '$0 remove bafy...',
  exampleOut: `unlinked bafy...`,
}

export default remove
