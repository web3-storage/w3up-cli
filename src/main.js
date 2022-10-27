import car from './commands/car/index.js'
import delegations from './commands/delegations/index.js'
import id from './commands/id.js'
import info from './commands/info.js'
// import insights from './commands/insights.js'
import open from './commands/open.js'
import register from './commands/register.js'
import settings from './commands/settings/index.js'
import store from './commands/store/index.js'
import upload from './commands/upload.js'
import uploadCars from './commands/uploadCars.js'
import uploads from './commands/uploads/index.js'
import list from './commands/uploads/list.js'
import whoami from './commands/whoami.js'
import printQuickstart from './quickstart.js'
import _yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

/**
 * @type {import('yargs').Argv<{}>} yargs
 */
const yargs = _yargs(hideBin(process.argv))

export const main = async () => {
  const argv = await yargs
    .scriptName('w3up')
    //     .usage('Usage:\n  $0 <cmd> [options]')
    .option('p', {
      alias: 'profile',
      type: 'string',
      describe: 'Select profile.',
      default: 'main'
    })
    .group('profile', 'Global:')
    .command({
      command: '*',
      handler () {
        printQuickstart()
        yargs.showHelp()
      }
    })
    .command({
      command: 'completion',
      handler () {
        yargs.showCompletionScript()
      }
    })

    // registration
    .command(id)
    .command(register)
    .command(whoami)

    .command(list)

    //
    .command(upload)
    .command(uploadCars)
    .command(open)

    // subcommands
    .command(settings)
    .command(store)
    .command(uploads)
    .command(delegations)

    .command(car)
    .command(info)

    .help()
    //     .showHelpOnFail(true)
    .demandCommand(1, '')
    .recommendCommands()
    .strict()
    .wrap(yargs.terminalWidth())
    .epilog('Docs:\n  https://github.com/web3-storage/w3up-cli').argv

  return argv
}
