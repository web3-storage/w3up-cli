#!/usr/bin/env node

import _yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const yargs = _yargs(hideBin(process.argv))

const register = {
  description: 'Register your UCAN Identity with w3up',
  build: () => {},
  exe: () => {},
}

const list = {
  description: 'List your uploads',
  build: () => {},
  exe: () => {},
  exampleOut: `bafy...\nbafy...`,
  exampleIn: '$0 list',
}

const id = {
  description: 'Generate a UCAN Identity',
  build: () => {},
  exe: () => {},
  exampleOut: `example out`,
  exampleIn: '$0 id',
}

const whoami = {
  description: 'Show your current UCAN Identity',
  build: () => {},
  exe: () => {},
  exampleOut: `DID:12345`,
  exampleIn: '$0 whoami',
}

const importSettings = {
  description: 'Import a settings.json file',
  build: () => {},
  exe: () => {},
  exampleOut: `DID:12345`,
  exampleIn: '$0 import-settings',
}

const exportSettings = {
  description: 'Export a settings.json file',
  build: () => {},
  exe: () => {},
  exampleOut: `DID:12345`,
  exampleIn: '$0 export-settings',
}

const resetSettings = {
  description: 'Delete all local settings',
  build: () => {},
  exe: () => {},
  exampleOut: `DID:12345`,
  exampleIn: '$0 reset-settings',
}

export const main = async () => {
  const argv = await yargs
    .scriptName('w3up')
    .usage('Usage:\n  $0 <cmd> [args]')

    .command('id', id.description, id.build, id.exe)
    .command('register', register.description, register.build, register.exe)
    .command('whoami', whoami.description, whoami.build, whoami.exe)

    .command('list', list.description, list.build, list.exe)
    .example(list.exampleIn, list.exampleOut)

    .command(
      'import-settings',
      importSettings.description,
      importSettings.build,
      importSettings.exe
    )
    .command(
      'export-settings',
      exportSettings.description,
      exportSettings.build,
      exportSettings.exe
    )
    .command(
      'reset-settings',
      resetSettings.description,
      resetSettings.build,
      resetSettings.exe
    )

    .help()
    .showHelpOnFail(true)
    .demandCommand(1, '')
    .recommendCommands()
    .strict()
    .epilog('Docs:\n  https://github.com/nftstorage/w3up-cli').argv

  return argv
}
