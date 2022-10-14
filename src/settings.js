import * as API from '@ucanto/interface'
import { config } from 'dotenv'

import { humanizeBytes } from './utils.js'

config()

// export const MAX_CAR_SIZE = Math.pow(1024, 2) * 8 //8MB
// export const MAX_CAR_SIZE = Math.pow(1024, 2) * 512 //512MB
export const MAX_CAR_SIZE = Math.pow(1024, 3) * 2 //2GB
//1800000000 //1.8GB

const projectName = 'w3-cli'

const W3_STORE_DID =
  process.env.W3_STORE_DID ||
  'did:key:z6MkrZ1r5XBFZjBU34qyD8fueMbMRkKw17BZaq2ivKFjnz2z' //staging key

const SERVICE_URL =
  process.env.SERVICE_URL ||
  'https://8609r1772a.execute-api.us-east-1.amazonaws.com' // production url
//'https://mk00d0sf0h.execute-api.us-east-1.amazonaws.com/' //staging url

const ACCESS_URL = process.env.ACCESS_URL || 'https://access-api.web3.storage' // production
//'https://auth-dev.dag.haus' //stagin/dev url

const ACCESS_DID =
  process.env.ACCESS_DID ||
  'did:key:z6MkkHafoFWxxWVNpNXocFdU6PL2RVLyTEgS1qTnD3bRP7V9' // production
//'did:key:z6MksafxoiEHyRF6RsorjrLrEyFQPFDdN6psxtAfEsRcvDqx' // dev/staging did

export const OPEN_WITH_SERVICE_URL = `https://w3s.link/ipfs/`

export default {
  projectName,
  W3_STORE_DID,
  SERVICE_URL,
  ACCESS_DID,
  ACCESS_URL,
  MAX_CAR_SIZE,
  MAX_CAR_SIZE_HUMANIZED: humanizeBytes(MAX_CAR_SIZE),
}
