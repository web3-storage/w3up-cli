import { buildCar } from '../lib/car.js';
import fs from 'fs';

export const generateCar = async (path) => {
  console.log('hello', path);
  return buildCar(path);
};

export const writeFileLocally = async (car, outPath = 'output.car') => {
  fs.writeFileSync(outPath, car, { encoding: 'binary' });
};
