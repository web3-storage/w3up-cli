// import 'web-streams-polyfill';
import { TransformStream } from '@web-std/stream';
import * as UnixFS from '@ipld/unixfs';
import * as CAR from '@ipld/car';
import * as DAG_CBOR from '@ipld/dag-cbor';
import fs from 'fs';

// Create a redable & writable streams with internal queue that can hold around 32 blocks
const CAPACITY = 1048576 * 32;

// TODO: Pass bytes instead.
async function fileToBlock({ writer, filename, bytes }) {
  // make file writer, write to it, and close it to get link/cid
  const file = UnixFS.createFileWriter(writer);
  file.write(bytes);
  const fileLink = await file.close();

  return {
    name: filename,
    link: fileLink,
  };
}

async function wrapFilesWithDir({ writer, files }) {
  const dir = UnixFS.createDirectoryWriter(writer);
  files.forEach((file) => dir.set(file.name, file.link));
  const dirLink = await dir.close();

  return {
    name: '',
    link: dirLink,
  };
}

async function createReadableBlockStreamWithWrappingDir() {
  // Create a redable & writable streams with internal queue that can
  // hold around 32 blocks
  const { readable, writable } = new TransformStream(
    {},
    UnixFS.withCapacity(CAPACITY)
  );

  // Next we create a writer with filesystem like API for encoding files and
  // directories into IPLD blocks that will come out on `readable` end.
  const writer = UnixFS.createWriter({ writable });

  const file = await fileToBlock({
    writer,
    filename: 'test.md',
    //TODO: get bytse from somehwere else
    bytes: new TextEncoder().encode('hello world, this is a test'),
  });

  const file2 = await fileToBlock({
    writer,
    filename: 'test2.md',
    //TODO: get bytse from somehwere else
    bytes: new TextEncoder().encode('this is another test'),
  });

  const dir = await wrapFilesWithDir({ writer, files: [file, file2] });

  // close the writer to close underlying block stream.
  //   writer.close();

  // return the root and the readable stream.
  return {
    cid: dir.link.cid,
    writer,
    readable,
  };
}

async function buildMetaData(writer) {
  const metadata = {
    id: 'some_id',
  };

  const bytes = DAG_CBOR.encode(metadata);
  const file = UnixFS.createFileWriter(writer);
  file.write(bytes);
  const fileLink = await file.close();

  return {
    name: '________meta',
    link: fileLink,
  };
}

export const generateCar = async (path) => {
  const { cid, writer, readable } =
    await createReadableBlockStreamWithWrappingDir();

  const metadata = await buildMetaData(writer);
  // close the writer to close underlying block stream.
  writer.close();

  const buffer = new ArrayBuffer(CAPACITY);
  var bw = CAR.CarBufferWriter.createWriter(buffer, {
    roots: [cid, metadata.link.cid],
  });

  const reader = readable.getReader();

  function writeBlockToCar({ done, value }) {
    if (!done) {
      bw.write(value);
      //TODO: detect when buffer overrun, and create new writer, linking new car to prev
      return reader.read().then(writeBlockToCar);
    }
  }
  await reader.read().then(writeBlockToCar);
  return bw.close({ resize: true });
};

export const writeFileLocally = async (car) => {
  fs.writeFileSync('stream.car', car, { encoding: 'binary' });
};
