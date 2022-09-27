import _yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import delegate from './commands/delegate.js'
import exportSettings from './commands/exportSettings.js'
import generateCar from './commands/generateCar.js'
import id from './commands/id.js'
import importDelegation from './commands/importDelegation.js'
import importSettings from './commands/importSettings.js'
import info from './commands/info.js'
import insights from './commands/insights.js'
import inspectCar from './commands/inspectCar.js'
import list from './commands/list.js'
import accounts from './commands/listAccounts.js'
import register from './commands/register.js'
import remove from './commands/remove.js'
import resetSettings from './commands/resetSettings.js'
// import setup from './commands/setup.js'
import switchAccount from './commands/switchAccount.js'
import upload from './commands/upload.js'
import uploadCars from './commands/uploadCars.js'
import whoami from './commands/whoami.js'
import printQuickstart from './quickstart.js'

/**
 * @type {import('yargs').Argv<{}>} yargs
 */
const yargs = _yargs(hideBin(process.argv))

export const main = async () => {
  const argv = await yargs
    .scriptName('w3up')
    .usage('Usage:\n  $0 <cmd> [options]')
    .command({
      command: '*',
      handler() {
        printQuickstart()
        yargs.showHelp()
      },
    })
    .command({
      command: 'completion',
      handler() {
        yargs.showCompletionScript()
      },
    })

    //registration
    .command(id)
    //     .command(setup)
    //     .example(id.exampleIn, id.exampleOut)

    .command(register)
    .command(whoami)
    //     .example(whoami.exampleIn, whoami.exampleOut)

    //general usage
    .command(list)
    //     .example(list.exampleIn, list.exampleOut)
    .command(upload)
    //     .example(upload.exampleIn, upload.exampleOut)
    .command(uploadCars)
    //     .example(uploadCars.exampleIn, uploadCars.exampleOut)
    .command(remove)
    //     .example(remove.exampleIn, remove.exampleOut)

    //settings
    .command(importSettings)
    .command(exportSettings)
    .command(resetSettings)

    //general usage
    .command(delegate)
    .command(accounts)
    .command(importDelegation)
    .command(switchAccount)

    //insights
    .command(insights)

    //utilities
    .command(inspectCar)
    //     .example(inspectCar.exampleIn, inspectCar.exampleOut)

    .command(generateCar)
    //     .example(generateCar.exampleIn, generateCar.exampleOut)

    .command(info)
    //     .example(info.exampleIn, info.exampleOut)

    .help()
    //     .showHelpOnFail(true)
    .demandCommand(1, '')
    .recommendCommands()
    .strict()
    .wrap(yargs.terminalWidth())
    .epilog('Docs:\n  https://github.com/nftstorage/w3up-cli').argv

  return argv
}
