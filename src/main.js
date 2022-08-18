#!/usr/bin/env node

import _yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import id from './commands/id.js'
import register from './commands/register.js'
import list from './commands/list.js'
import whoami from './commands/whoami.js'
import remove from './commands/remove.js'

import importSettings from './commands/importSettings.js'
import exportSettings from './commands/exportSettings.js'
import resetSettings from './commands/resetSettings.js'

const yargs = _yargs(hideBin(process.argv))

const insights = {
  description: 'get insight for cid',
  build: () => {},
  exe: () => {},
  exampleOut: `DID:12345`,
  exampleIn: '$0 insights bafy...',
}

const insightsWs = {
  description: 'Delete all local settings',
  build: () => {},
  exe: () => {},
  exampleOut: `DID:12345`,
  exampleIn: '$0 insights-ws',
}

export const main = async () => {
  const argv = await yargs
    .scriptName('w3up')
    .usage('Usage:\n  $0 <cmd> [args]')

    .command(id.cmd, id.description, id.build, id.exe)
    .example(id.exampleIn, id.exampleOut)

    .command(register.cmd, register.description, register.build, register.exe)
    .command(whoami.cmd, whoami.description, whoami.build, whoami.exe)
    .example(whoami.exampleIn, whoami.exampleOut)

    .command(list.cmd, list.description, list.build, list.exe)
    .example(list.exampleIn, list.exampleOut)

    .command(remove.cmd, remove.description, remove.build, remove.exe)
    .example(remove.exampleIn, remove.exampleOut)

    .command(
      importSettings.cmd,
      importSettings.description,
      importSettings.build,
      importSettings.exe
    )
    .command(
      exportSettings.cmd,
      exportSettings.description,
      exportSettings.build,
      exportSettings.exe
    )
    .command(
      resetSettings.cmd,
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
