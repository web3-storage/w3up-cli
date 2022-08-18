import * as DAG_CBOR from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';

export async function buildMetaData() {
  const metadata = {
    id: Math.floor(Math.random() * 100000),
  };

  const bytes = DAG_CBOR.encode(metadata);
  const digest = await sha256.digest(bytes);
  const cid = CID.createV1(DAG_CBOR.code, digest);

  return {
    cid,
    bytes,
  };
}
