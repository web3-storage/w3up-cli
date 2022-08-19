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
    var car = await buildCar(filePath)
    console.log('writing file')
    writeFileLocally(car, outputPath)

    if (car) {
      view.succeed(`${car}`)
      console.log(`CAR created ${filePath} => ${outputPath || 'output.car'}`)
    } else {
      view.fail('Car generation failed')
    }
  } catch (err) {
    view.fail('Error:', err)
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
  exampleOut: `CAR created ../duck.png => duck.car`,
}

export default generateCar
