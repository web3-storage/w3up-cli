import { humanizeBytes } from './utils.js'
import { config } from 'dotenv'

config()

// export const MAX_CAR_SIZE = Math.pow(1024, 2) * 8 //8MB
// export const MAX_CAR_SIZE = Math.pow(1024, 2) * 512 //512MB
export const MAX_CAR_SIZE = Math.pow(1024, 3) * 2 // 2GB
// 1800000000 //1.8GB

const projectName = 'w3-cli'

const SERVICE_URL =
  process.env.SERVICE_URL ||
  'https://8609r1772a.execute-api.us-east-1.amazonaws.com' // production url

const ACCESS_URL = process.env.ACCESS_URL || 'https://access-api.web3.storage' // production

export const OPEN_WITH_SERVICE_URL = 'https://w3s.link/ipfs/'

export default {
  projectName,
  SERVICE_URL,
  ACCESS_URL,
  MAX_CAR_SIZE,
  MAX_CAR_SIZE_HUMANIZED: humanizeBytes(MAX_CAR_SIZE)
}
