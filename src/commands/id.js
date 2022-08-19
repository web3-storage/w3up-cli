import client from '../client.js'
import { settings } from '../client.js'

const exe = async () => {
  if(!settings.has('secret')) {
    console.log('Generating id...')
  } else {
    console.log('Loading id...')
  }
  const id = await client.identity()
  if (id) {
    console.log('ID loaded: ' + id.did())
  }
}

const id = {
  cmd: 'id',
  description: 'Generate a UCAN Identity',
  build: () => {},
  exe,
  exampleOut: `ID loaded: did:key:z6MkiWm...`,
  exampleIn: '$0 id',
}

export default id
