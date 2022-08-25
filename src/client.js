import Conf from 'conf'
// @ts-ignore
import W3Client from 'w3up-client'
import { config } from 'dotenv'
// @ts-ignore
import * as CBOR from '@ucanto/transport/cbor'

config()

const W3_STORE_DID =
  process.env.W3_STORE_DID ||
  'did:key:z6MkrZ1r5XBFZjBU34qyD8fueMbMRkKw17BZaq2ivKFjnz2z' //staging key
const SERVICE_URL =
  process.env.SERVICE_URL ||
  'https://8609r1772a.execute-api.us-east-1.amazonaws.com'
//   'https://mk00d0sf0h.execute-api.us-east-1.amazonaws.com/' //staging url

const ACCESS_URL = process.env.ACCESS_URL || 'https://auth-dev.dag.haus'
const ACCESS_DID =
  process.env.ACCESS_DID ||
  'did:key:z6MksafxoiEHyRF6RsorjrLrEyFQPFDdN6psxtAfEsRcvDqx' // dev/staging did

const serialize = ({ ...data }) =>
  Buffer.from(CBOR.codec.encode(data)).toString('binary')

/**
 * @param {string} text
 */
const deserialize = (text) => CBOR.codec.decode(Buffer.from(text, 'binary'))

// @ts-ignore
export const settings = new Conf({
  projectName: 'w3-cli',
  fileExtension: 'cbor',
  serialize,
  deserialize,
})

const client = new W3Client({
  serviceDID: W3_STORE_DID,
  serviceURL: SERVICE_URL,
  accessDID: ACCESS_DID,
  accessURL: ACCESS_URL,
  settings,
})

export default client
