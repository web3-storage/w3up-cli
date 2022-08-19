import ora from 'ora'
import { isPath, resolvePath } from '../validation.js'
import fs from 'fs'

import { buildCar } from '../lib/car.js'

export const writeFileLocally = async (car, outPath = 'output.car') => {
  fs.writeFileSync(outPath, car, { encoding: 'binary' })
}

const exe = async (argv) => {
  const { filePath, outputPath } = argv
  const view = ora(`Generating Car from ${filePath}...`).start()

  try {
    var car = await buildCar(resolvePath(filePath))

    writeFileLocally(car, outputPath)

    if (car) {
      view.succeed(`${car}`)
    } else {
      view.fail('Car generation failed')
    }
  } catch (err) {
    view.fail(err)
  }
}

const build = (yargs) => {
  yargs.check((argv) => {
    const { filePath, outputPath } = argv
    try {
      isPath(filePath)
      return true
    } catch (err) {
      throw new Error(
        `${filePath} is probably not a valid path to a file or directory: \n${err}`
      )
    }
  })
  return yargs
}

const generateCar = {
  cmd: 'generate-car <filePath> [outputPath]',
  description: 'From an input file, locally generate a CAR file.',
  build,
  exe,
  exampleIn: '$0 generate-car ../duck.png duck.car',
  exampleOut: `generated duck.car from ../duck.png`,
}

export default generateCar
