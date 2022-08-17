// import { buildCar } from '../lib/car.js'
import fs from 'fs'

import { buildCar } from '../lib/car.js'

export const generateCar = async (path) => {
  return buildCar(path)
}

export const writeFileLocally = async (car, outPath = 'output.car') => {
  fs.writeFileSync(outPath, car, { encoding: 'binary' })
}
