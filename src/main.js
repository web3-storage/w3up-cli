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

export const main = async () => {
  const argv = await yargs
    .scriptName('w3up')
    .usage('Usage:\n  $0 <cmd> [args]')

    .command('list', list.description, list.build, list.exe)
    .example(list.exampleIn, list.exampleOut)

    .command('register', register.description, register.build, register.exe)

    .help()
    .showHelpOnFail(true)
    .demandCommand(1, '')
    .recommendCommands()
    .strict()
    .epilog('Docs:\n  https://github.com/nftstorage/w3up-cli').argv

  return argv
}
