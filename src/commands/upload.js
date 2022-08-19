import client from '../client.js'
import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'

const exe = async (argv) => {
  const { path } = argv
  const view = ora(`Uploading ${path}...`).start()

  const buffer = fs.readFileSync(resolvePath(path))
  const response = await client.upload(buffer)
  if (response) {
    view.succeed(`${response}`)
  } else {
    view.fail('Upload did not complete successfully')
  }
}

const build = (yargs) => {
  yargs.check((argv) => {
    const { path } = argv
    try {
      isPath(path)
      return true
    } catch (err) {
      throw new Error(
        `${path} is probably not a valid path to a file or directory: \n${err}`
      )
    }
  })
  return yargs
}

const upload = {
  cmd: ['upload <path>', 'import <path>'],
  description: 'Upload a file or directory to your account',
  build,
  exe,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: `uploaded bafy...`,
}

export default upload
