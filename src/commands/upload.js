import client from '../client.js'
import ora from 'ora'
import { hasID, isPath, resolvePath } from '../validation.js'
import fs from 'fs'

const exe = async (argv) => {
  const { path } = argv
  const view = ora({ text: `Uploading ${path}...`, spinner: 'line' }).start()

  try {
    const buffer = await fs.promises.readFile(resolvePath(path))
    const response = await client.upload(buffer)
    if (response) {
      view.succeed(`${response}`)
    }
  } catch (err) {
    view.fail('Upload did not complete successfully, check w3up-failure.log')
    await fs.promises.appendFile('w3up-failure.log', JSON.stringify(err) + '\n')
  }
}

const build = (yargs) =>
  yargs
    .check(() => hasID())
    .check(({ path }) => {
      try {
        return isPath(path)
      } catch (err) {
        throw new Error(
          `${path} is probably not a valid path to a file or directory: \n${err}`
        )
      }
    })

const upload = {
  cmd: ['upload <path>', 'import <path>'],
  description: 'Upload a file or directory to your account',
  build,
  exe,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: `uploaded bafy...`,
}

export default upload
