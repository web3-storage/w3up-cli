#!/usr/bin/env node

import * as CBOR from '@ucanto/transport/cbor';
import Z from 'zod';
import * as Soly from 'soly';
import { script } from 'subprogram';
import path from 'path';
import { pathToFileURL } from 'url';
import { parseLink } from '@ucanto/server';
import Conf from 'conf';

import {
  resetSettings,
  exportSettings,
  importSettings,
} from './commands/settings.js';
import { register } from './commands/register.js';
import { printHelp } from './commands/help.js';
import { createClient } from './client.js';
import { generateCar, writeFileLocally } from './commands/generateCar.js';

// TODO: Extract to some interface.
const settings = new Conf({
  projectName: 'w3-cli',
  fileExtension: 'cbor',
  serialize: ({ ...data }) =>
    Buffer.from(CBOR.codec.encode(data)).toString('binary'),
  deserialize: (text) => CBOR.codec.decode(Buffer.from(text, 'binary')),
});

const client = createClient(settings);
const cli = Soly.createCLI('w3-cli');

cli
  .command('register', (input) => {
    const [data] = input.positionals(Soly.string().optional(), 0);
    return async () => await register(client, data?.value);
  })
  .command('upload', (input) => {
    const [carPath] = input.positionals([Soly.path()]);
    return async () => {
      if (!carPath.value) {
        console.log('You must provide the path to a car file to upload.');
      }
      //check to make sure its a CAR here.
      const response = await client.upload(resolveURL(carPath.value));
      console.log(response);
    };
  })
  .command('generate-car', (input) => {
    const [carPath] = input.positionals(Soly.path().optional());

    return async () => {
      if (!carPath.value) {
        console.log('You must provide a path to generate a car from.');
        return;
      }
      var data = await generateCar(carPath);
      writeFileLocally(data);
    };
  })
  .command('unlink', (input) => {
    const [link] = input.positionals([Z.string().refine(parseLink)]);
    return async () => {
      const response = await client.remove(parseLink(link.value));
      console.log(response);
    };
  })
  .command('list', () => async () => {
    const list = await client.list();
    console.log('List of uploaded/linked cars:\n' + list.join('\n'));
  })
  .command('id', () => async () => {
    const id = await client.identity();
    console.log('ID loaded: ' + id.did());
  })
  .command('whoami', () => async () => console.log(await client.whoami()))
  .command('reset-settings', () => async () => resetSettings({ settings }))
  .command('export-settings', () => async () => exportSettings({ settings }))
  .command('import-settings', (input) => {
    const [data] = input.positionals(Soly.string().optional(), 0);
    return async () => importSettings({ settings, fileName: data.value || '' });
  })
  .command('insights', (input) => {
    const [data] = input.positionals(Soly.string().optional(), 0);
    return async () => {
      const cid = data?.value || '';
      if (cid.length > 0) {
        const response = await client.insights(cid);
        console.log('response', response);
      } else {
        console.log('You must provide a CID to get insights for.');
      }
    };
  })
  .command('insights-ws', (input) => {
    const [data] = input.positionals(Soly.string().optional(), 0);
    return async () => {
      const cid = data?.value || '';
      if (cid.length > 0) {
        const response = await client.insightsWS(cid);
        console.log('response', response);
      } else {
        console.log('You must provide a CID to get insights for.');
      }
    };
  })
  //   .command('help', () => () => printHelp(cli))
  .action(() => printHelp(cli));

export const main = async () => cli.parse(process.argv);

/**
 *
 * @param {string} relativeFilepath
 * @returns {URL}
 */

const resolveURL = (relativeFilepath) =>
  pathToFileURL(path.resolve(process.cwd(), relativeFilepath));

script({ ...import.meta, main, dotenv: true });
