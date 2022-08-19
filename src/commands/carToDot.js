import client from '../client.js'
import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'
import { run as carInfo } from '../lib/carInfo.js'

const exe = async (argv) => {
  const { path } = argv
  const view = ora(`Uploading ${path}...`).start()

  const buffer = fs.readFileSync(resolvePath(path))
  const info = await carInfo(buffer)
  if (info) {
    view.succeed(`${info}`)
  } else {
    view.fail('Car To Dot did not complete successfully')
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
        `${path} is probably not a valid path to a CAR file or directory: \n${err}`
      )
    }
  })
  return yargs
}

const upload = {
  cmd: 'car-to-dot <path>',
  description: 'Generate an examination file from a <path> to a CAR ',
  build,
  exe,
  exampleIn: '$0 car-to-dot ../duck.car',
  exampleOut: `generated examination file`,
}

export default upload
