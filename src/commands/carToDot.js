import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'
import { run as carInfo } from '../lib/carInfo.js'

// do not use ora for output, so it can be piped to dot/etc for building image.
const exe = async (argv) => {
  const { path } = argv
  const buffer = fs.readFileSync(resolvePath(path))
  const info = await carInfo(buffer)
  console.log(info)
}

const build = (yargs) => yargs.check(({ path }) => isPath(path))

const upload = {
  cmd: 'car-to-dot <path>',
  description: 'Generate an examination file from a <path> to a CAR ',
  build,
  exe,
  exampleIn: '$0 car-to-dot ../duck.car',
  exampleOut: `generated examination file`,
}

export default upload
