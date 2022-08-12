import W3Client from 'w3up-client';

// TODO: Figure out why the .env broke?
const W3_STORE_DID =
  process.env.W3_STORE_DID ||
  'did:key:z6MkrZ1r5XBFZjBU34qyD8fueMbMRkKw17BZaq2ivKFjnz2z'; //staging key
const SERVICE_URL =
  process.env.SERVICE_URL ||
  'https://mk00d0sf0h.execute-api.us-east-1.amazonaws.com/'; //staging url
//   'https://hgapw4sftk.execute-api.us-east-1.amazonaws.com' //icebreaker dev url

export function createClient(settings) {
  return new W3Client({
    serviceDID: W3_STORE_DID,
    serviceURL: SERVICE_URL,
    settings,
  });
}
